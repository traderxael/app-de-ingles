// Service Worker opt-in de Scene Words. Solo atiende GET same-origin de la
// lista de assets y sirve copia local cuando no hay red. No captura otras rutas.
const CACHE = 'lingoquest-scene-v1';
const ASSETS = [
  '/', '/index.html', '/curriculum.json',
  '/css/style.css', '/css/games.css', '/css/scene.css',
  '/js/app.js', '/js/data/lessons.js', '/js/data/sceneWords.js',
  '/js/services/audio.js', '/js/services/speech.js', '/js/services/storage.js', '/js/services/sceneDetector.js',
  '/js/games/wordBuilder.js', '/js/games/speedMatch.js', '/js/games/flashcards.js',
  '/js/games/roleplay.js', '/js/games/wordFall.js', '/js/games/sentenceScramble.js',
  '/js/games/sceneWords.js', '/js/games/audioDetective.js',
  '/vendor/scene/tf-4.22.0.min.js', '/vendor/scene/coco-ssd-2.2.3.min.js',
  '/vendor/scene/model.json', '/vendor/scene/group1-shard1of5', '/vendor/scene/group1-shard2of5',
  '/vendor/scene/group1-shard3of5', '/vendor/scene/group1-shard4of5', '/vendor/scene/group1-shard5of5'
];

self.addEventListener('install', e => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (!ASSETS.includes(url.pathname) && !url.pathname.startsWith('/vendor/scene/')) return;
  e.respondWith(
    caches.open(CACHE).then(cache => cache.match(e.request).then(hit =>
      hit || fetch(e.request).then(res => { if (res.ok) cache.put(e.request, res.clone()); return res; })
    ))
  );
});

self.addEventListener('message', e => {
  if (e.data !== 'CACHE_SCENE') return;
  const port = e.ports[0];
  (async () => {
    const cache = await caches.open(CACHE);
    let count = 0;
    for (const asset of ASSETS) {
      const res = await fetch(new Request(asset, { cache: 'reload' }));
      if (!res.ok) throw new Error(asset);
      await cache.put(asset, res);
      count++;
    }
    port.postMessage({ ok: true, count });
  })().catch(err => port.postMessage({ ok: false, error: String(err.message || err) }));
});
