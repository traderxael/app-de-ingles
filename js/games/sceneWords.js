import { SCENE_BY_CLASS } from '../data/sceneWords.js';
import { storageService } from '../services/storage.js';
import { speechService } from '../services/speech.js';
import { loadSceneDetector, validatePhoto, sceneStory } from '../services/sceneDetector.js';

export class SceneWordsGame {
  constructor(container,onExit) { this.container=container; this.onExit=onExit; this.token=0; this.closed=false; this.model=null; this.pending=null; }
  q(s) { return this.container.querySelector(s); }
  status(text) { if (!this.closed) this.q('#scene-status').textContent=text; }
  start() {
    this.container.innerHTML=`<section class="scene-view">
      <header><h2>📷 Scene Words</h2><button id="scene-close" aria-label="Cerrar Scene Words">✕</button></header>
      <p>Descubre inglés en una foto. Procesamiento en este dispositivo; la foto no se sube ni se guarda. Solo 80 clases: puede equivocarse.</p>
      <label class="scene-file-label">Elegir foto / cámara (JPG, PNG, WebP; máx. 10 MB)<input id="scene-file" type="file" accept="image/jpeg,image/png,image/webp" capture="environment"></label>
      <button id="scene-delete-photo">Borrar foto</button>
      <p id="scene-status" role="status" aria-live="polite">Elige una foto. El modelo local ocupa unos 23 MB.</p>
      <canvas id="scene-canvas" hidden aria-label="Foto con recuadros de detección"></canvas>
      <div id="scene-chips" class="scene-chips" aria-label="Objetos detectados"></div>
      <div id="scene-detail" hidden></div>
      <h3>Mis palabras</h3><div id="scene-saved" class="scene-chips"></div>
      <button id="scene-story">Crear historia de plantilla</button><p>No es IA generativa: combina ejemplos escritos, no describe tu foto.</p><p id="scene-story-text"></p>
      <div class="scene-tools"><button id="scene-export">Exportar vocabulario</button><label>Importar JSON<input type="file" id="scene-import" accept="application/json,.json"></label>
      <button id="scene-offline">Activar copia offline (~23 MB)</button><button id="scene-clear-offline">Eliminar copia offline</button></div>
    </section>`;
    this.q('#scene-close').onclick=()=>this.onExit();
    this.q('#scene-file').onchange=e=>{ const f=e.target.files[0]; if(f) this.photo(f); };
    this.q('#scene-delete-photo').onclick=()=>this.clearPhoto();
    this.q('#scene-story').onclick=()=>{this.q('#scene-story-text').textContent=sceneStory(storageService.getSceneWords());};
    this.q('#scene-export').onclick=()=>{
      const url=URL.createObjectURL(new Blob([storageService.exportSceneWords()],{type:'application/json'}));
      const a=document.createElement('a'); a.href=url; a.download='scene-words.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
    };
    this.q('#scene-import').onchange=async e=>{
      const f=e.target.files[0]; const token=this.token;
      try { if(!f || f.size>16384) throw new Error('JSON máximo 16 KB.'); const text=await f.text(); if(this.closed||token!==this.token)return; storageService.importSceneWords(text); this.saved(); this.status('Vocabulario importado.'); }
      catch { this.status('No se pudo importar: JSON versión 1, solo IDs válidos (máx. 16 KB).'); } finally { e.target.value=''; }
    };
    this.q('#scene-offline').onclick=()=>this.offline();
    this.q('#scene-clear-offline').onclick=async()=>{
      try { for(const key of await caches.keys()) if(key.startsWith('lingoquest-scene-')) await caches.delete(key);
        for(const reg of await navigator.serviceWorker.getRegistrations()) if(reg.active?.scriptURL.endsWith('/scene-sw.js')) await reg.unregister();
        this.status('Copia offline eliminada. Recarga para terminar de desactivarla.');
      } catch {this.status('No se pudo eliminar la copia offline.');}
    };
    this.saved();
  }
  saved() {
    const el=this.q('#scene-saved'); el.replaceChildren();
    for(const word of storageService.getSceneWords()) {
      const b=document.createElement('button'); b.textContent=`${word.word} ×`; b.setAttribute('aria-label',`Eliminar ${word.word}`);
      b.onclick=()=>{try {storageService.removeSceneWord(word.id); this.saved(); this.q('#scene-story-text').textContent='';}catch{this.status('No se pudo guardar el cambio.');}}; el.append(b);
    }
    if(!el.children.length) el.textContent='Aún no hay palabras. Toca un objeto y guárdalo para Repaso.';
  }
  clearPhoto() {
    this.token++; this.q('#scene-file').value=''; this.q('#scene-canvas').hidden=true;
    const canvas=this.q('#scene-canvas'); canvas.width=1; canvas.height=1;
    this.q('#scene-chips').replaceChildren(); this.q('#scene-detail').replaceChildren(); this.q('#scene-detail').hidden=true;
    this.status('Foto borrada. Conservas únicamente las palabras guardadas.');
  }
  async photo(file) {
    if(this.busy) {this.status('Espera a que termine la detección anterior.');return;}
    this.clearPhoto(); const token=this.token; this.busy=true;
    let url, image;
    try {
      validatePhoto(file); this.status('Leyendo foto…');
      url=URL.createObjectURL(file); image=new Image(); image.src=url; await image.decode();
      if(image.naturalWidth*image.naturalHeight>24000000) throw new Error('Imagen demasiado grande: máximo 24 megapíxeles.');
      if(this.closed||token!==this.token)return;
      const canvas=this.q('#scene-canvas'), scale=Math.min(1,1280/Math.max(image.naturalWidth,image.naturalHeight));
      canvas.width=Math.round(image.naturalWidth*scale); canvas.height=Math.round(image.naturalHeight*scale); canvas.hidden=false;
      const ctx=canvas.getContext('2d'); ctx.drawImage(image,0,0,canvas.width,canvas.height);
      this.status('Cargando modelo y detectando objetos… Puede tardar en este dispositivo.');
      if(!this.model) this.model=await loadSceneDetector();
      if(this.closed||token!==this.token)return;
      // Offscreen snapshot survives deletion/close without retaining the source file.
      const snapshot=document.createElement('canvas'); snapshot.width=canvas.width; snapshot.height=canvas.height; snapshot.getContext('2d').drawImage(canvas,0,0);
      this.pending=this.model.detect(snapshot,20,0.5); const predictions=await this.pending; snapshot.width=1; snapshot.height=1;
      if(this.closed||token!==this.token)return;
      const valid=predictions.filter(p=>SCENE_BY_CLASS.has(p.class));
      for(const p of valid) {
        const w=SCENE_BY_CLASS.get(p.class); const [x,y,width,height]=p.bbox;
        ctx.strokeStyle='#15904b'; ctx.lineWidth=Math.max(2,canvas.width/250); ctx.strokeRect(x,y,width,height);
        ctx.font=`${Math.max(14,canvas.width/45)}px sans-serif`; ctx.fillStyle='#06391d'; ctx.fillText(w.word,Math.max(0,x),Math.max(20,y));
        const b=document.createElement('button'); b.className='scene-chip'; b.textContent=`${w.word} · ${Math.round(p.score*100)}%`;
        b.onclick=()=>this.detail(w); this.q('#scene-chips').append(b);
      }
      this.status(valid.length?`${valid.length} objetos posibles. Toca una etiqueta para aprender.`:'No se detectaron objetos conocidos. Prueba otra foto con buena luz.');
    } catch(e) { this.status(e.message.startsWith('Usa ')||e.message.startsWith('La foto')||e.message.startsWith('Imagen demasiado')?e.message:'No se pudo leer la foto o cargar/detectar con el modelo. Prueba JPG/PNG y vuelve a intentarlo.'); }
    finally { if(url)URL.revokeObjectURL(url); if(image) image.src=''; this.busy=false; this.pending=null; if(this.closed&&this.model){this.model.dispose();this.model=null;} }
  }
  detail(w) {
    const el=this.q('#scene-detail'); el.hidden=false;
    el.innerHTML=`<h3>${w.word} — ${w.translation}</h3><p>${w.phonetic}</p><p>${w.example}</p><button id="scene-speak">Escuchar (voz local)</button><button id="scene-save">Guardar para Repaso</button>`;
    this.q('#scene-speak').onclick=()=>{if(!speechService.speakLocal(w.word))this.status('No hay voz inglesa local disponible o el sonido está apagado. Puedes leer el IPA.');};
    this.q('#scene-save').onclick=()=>{try{storageService.saveSceneWord(w.id);this.saved();this.status('Palabra guardada para Repaso.');}catch{this.status('No se pudo guardar: revisa el espacio o permisos del navegador.');}};
  }
  async offline() {
    this.status('Preparando copia offline…');
    try {
      if(!('serviceWorker' in navigator))throw new Error();
      const reg=await navigator.serviceWorker.register(new URL('../../scene-sw.js',import.meta.url),{scope:new URL('../../',import.meta.url).pathname});
      await navigator.serviceWorker.ready;
      const worker=reg.active||reg.waiting;
      await new Promise((resolve,reject)=>{const channel=new MessageChannel(); const timer=setTimeout(()=>reject(new Error('timeout')),120000);
        channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();e.data.ok?resolve():reject(new Error());}; worker.postMessage('CACHE_SCENE',[channel.port2]);});
      this.status('Offline listo. Puedes recargar sin conexión en este navegador mientras conserve la copia.');
    } catch {this.status('No se pudo preparar offline. Usa HTTPS o localhost y comprueba espacio/conexión.');}
  }
  stop() { this.clearPhoto(); this.closed=true; speechService.synth?.cancel(); if(!this.busy&&this.model){this.model.dispose();this.model=null;} }
}
