import test from 'node:test';
import assert from 'node:assert/strict';
const saved = new Map();
globalThis.localStorage = {getItem: k => saved.get(k) ?? null, setItem: (k,v) => saved.set(k,v)};

test('scene storage only persists validated deduplicated IDs and preserves progress', async () => {
  const {storageService: s} = await import('../js/services/storage.js');
  assert.equal(typeof s.saveSceneWord, 'function');
  s.saveSceneWord('scene-dog'); s.saveSceneWord('scene-dog');
  assert.deepEqual(s.getSceneWords().map(w=>w.id), ['scene-dog']);
  assert.throws(()=>s.saveSceneWord('unknown'));
  assert.deepEqual(JSON.parse(s.exportSceneWords()), {version:1, wordIds:['scene-dog']});
  s.importSceneWords(JSON.stringify({version:1,wordIds:['scene-cat','scene-dog']}));
  assert.equal(s.getSceneWords().length, 2);
  for (const invalid of ['bad', '{"version":2,"wordIds":[]}', '{"version":1,"wordIds":["<script>"]}', '{"version":1,"wordIds":[],"photo":"secret"}']) {
    assert.throws(()=>s.importSceneWords(invalid));
  }
  const xpBeforeReview = s.getState().xp;
  s.recordCardReview('scene-dog',true);
  assert.equal(s.getState().xp, xpBeforeReview + 3, 'existing correct-review reward stays intact');
  const xp = s.getState().xp; // recordCardReview granted XP; scene delete must not touch progress
  s.removeSceneWord('scene-dog');
  assert.equal(s.getState().cardReviews['scene-dog'], undefined);
  assert.equal(s.getState().xp, xp);
  assert.ok(!s.exportSceneWords().includes('photo'));
  assert.deepEqual(s.getSceneWords().map(w=>w.id), ['scene-cat']);
});


test('COCO vocabulary covers all 80 classes with Spanish, IPA and examples', async () => {
  const { SCENE_WORDS } = await import('../js/data/sceneWords.js');
  assert.equal(SCENE_WORDS.length, 80);
  assert.equal(new Set(SCENE_WORDS.map(w => w.id)).size, 80);
  assert.equal(new Set(SCENE_WORDS.map(w => w.word)).size, 80);
  for (const w of SCENE_WORDS) {
    assert.match(w.id, /^scene-[a-z-]+$/);
    assert.ok(w.translation && w.phonetic && w.example.includes(w.word));
  }
});
