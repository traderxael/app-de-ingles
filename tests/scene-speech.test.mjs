import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
let spoken=[];let voices=[{name:'Remote',lang:'en-US',localService:false}];
globalThis.window={speechSynthesis:{getVoices:()=>voices,speak:u=>spoken.push(u),cancel:()=>{}}};
globalThis.SpeechSynthesisUtterance=class {constructor(text){this.text=text}};
test('private speech refuses remote/default voices; only explicitly local English',async()=>{
 const {speechService:s}=await import('../js/services/speech.js');
 assert.equal(typeof s.speakLocal,'function');
 assert.equal(s.speakLocal('dog'),false); assert.equal(spoken.length,0);
 voices.push({name:'Local',lang:'en-GB',localService:true});
 assert.equal(s.speakLocal('dog'),true); assert.equal(spoken[0].voice.name,'Local');
});
