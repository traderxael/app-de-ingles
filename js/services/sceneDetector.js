const ROOT = new URL('../../vendor/scene/', import.meta.url);
function script(name, global) {
  if (window[global]) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const el = document.createElement('script'); el.src = new URL(name, ROOT);
    el.onload = resolve; el.onerror = () => { el.remove(); reject(new Error('No se pudo cargar el motor local.')); };
    document.head.append(el);
  });
}
// One model per scene session. Caller disposes after pending inference finishes.
export async function loadSceneDetector() {
  await script('tf-4.22.0.min.js', 'tf');
  await script('coco-ssd-2.2.3.min.js', 'cocoSsd');
  await window.tf.ready();
  return window.cocoSsd.load({base:'lite_mobilenet_v2', modelUrl:new URL('model.json',ROOT).href});
}
export function validatePhoto(file) {
  if (!file || !['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Usa una foto JPG, PNG o WebP.');
  if (!file.size || file.size > 10 * 1024 * 1024) throw new Error('La foto debe pesar entre 1 byte y 10 MB.');
}
export function sceneStory(words) {
  if (!words.length) return 'Guarda palabras para crear una historia de plantilla.';
  return 'Today I explore the world. ' + words.slice(0,5).map(w => w.example).join(' ') + ' I learn something new!';
}
