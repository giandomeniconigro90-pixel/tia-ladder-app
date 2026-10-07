import test from 'node:test';
import assert from 'node:assert/strict';
import { EXAMPLES } from '../src/data/examples.js';
import { MODULES } from '../src/data/modules.js';
import { QUIZ } from '../src/data/quiz.js';
import { createSimulation, simulationReducer as step } from '../src/simulation.js';
import { loadCompleted, saveCompleted } from '../src/progress.js';
const example = id => createSimulation(EXAMPLES.findIndex(e => e.id === id));
const input = (s, bit, now=0) => step(s, {type:'input',bit,now});
const tick = (s, now) => step(s, {type:'tick',now});
test('TON uses elapsed time, resets and starts again', () => {
 let s=input(example('ton_timer'),'I0.0',100);
 assert.equal(tick(s,5099).bits['Q0.0'],false);
 s=tick(s,5100); assert.equal(s.bits['Q0.0'],true);
 s=input(s,'I0.0',5200); assert.equal(s.timer.et,0); assert.equal(s.timer.q,false);
 s=input(s,'I0.0',6000); assert.equal(tick(s,6001).timer.q,false);
});
test('TOF delays falling output and cancels delay on reactivation', () => {
 let s=example('tof_timer'); assert.equal(tick(s,10000).timer.q,false);
 s=input(s,'I0.0',11000); assert.equal(s.timer.q,true);
 s=input(s,'I0.0',12000); assert.equal(tick(s,15999).timer.q,true);
 assert.equal(tick(s,16000).timer.q,false);
 s=input(tick(s,13000),'I0.0',14000); assert.equal(tick(s,20000).timer.q,true);
});
test('CTU counts each rising edge once, continues above PV and resets', () => {
 let s=example('ctu_counter');
 for(let i=1;i<=7;i++){s=input(s,'I0.0');assert.equal(s.bits.CV,i);assert.equal(tick(s,999).bits.CV,i);assert.equal(s.bits['Q0.0'],i>=5);s=input(s,'I0.0');assert.equal(s.bits.CV,i);}
 s=input(s,'I0.1');assert.equal(s.bits.CV,0);s=input(s,'I0.0');assert.equal(s.bits.CV,0);
 s=input(s,'I0.1');assert.equal(s.bits.CV,0);
});
test('start-stop holds after release; stop dominates start', () => {
 let s=input(example('start_stop'),'I0.0');assert.equal(s.bits['Q0.0'],true);
 s=input(s,'I0.0');assert.equal(s.bits['Q0.0'],true);
 s=input(s,'I0.1');assert.equal(s.bits['Q0.0'],false);
 s=input(s,'I0.0');assert.equal(s.bits['Q0.0'],false);
});
test('storage accepts known lesson IDs and tolerates malformed/unavailable storage', () => {
 for(const raw of ['{','null','{}','42'])assert.equal(loadCompleted({getItem:()=>raw}).size,0);
 assert.deepEqual([...loadCompleted({getItem:()=> '["1.1","unknown","1.1"]'})],['1.1']);
 assert.equal(saveCompleted(new Set(),{setItem(){throw Error();}}),false);
});
test('content has unique lesson IDs, valid quiz answers and complete modules', () => {
 const ids=MODULES.flatMap(m=>m.lessons.map(l=>l.id));assert.equal(ids.length,20);assert.equal(new Set(ids).size,20);
 for(const q of QUIZ)assert.ok(Number.isInteger(q.ans)&&q.ans>=0&&q.ans<q.opts.length);
});
test('AND and OR match all input combinations', () => {
 for(let mask=0;mask<8;mask++) {let s=example('and_or');for(let i=0;i<3;i++)if(mask&(1<<i))s=input(s,`I0.${i}`);assert.equal(s.bits['Q0.0'],!!(mask&1)&&!!(mask&2));assert.equal(s.bits['Q0.1'],!!(mask&1)||!!(mask&4));}
});
test('separate SET then RESET coils retain memory and reset wins', () => {
 let s=input(example('set_reset'),'I0.0');s=input(s,'I0.0');assert.equal(s.bits['Q0.0'],true);
 s=input(s,'I0.0');s=input(s,'I0.1');assert.equal(s.bits['Q0.0'],false);
});
