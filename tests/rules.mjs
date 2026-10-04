import assert from 'node:assert/strict';
import{analyze,domain,rules,presets,verify}from '../dist/rules-core.mjs';
const weights=Object.fromEntries(rules.map(r=>[r.id,1]));
const run=(active,candidate=2,w=weights)=>analyze({active,candidate,weights:w});
assert.deepEqual(run([]).feasible,domain);
assert.deepEqual(run(presets.ambiguous).feasible,[-2,2]);
assert.deepEqual(run(presets.determined).feasible,[2]);
const wrong=run(presets.wrong,-2);assert.deepEqual(wrong.feasible,[-2]);assert(wrong.checks.every(r=>r.pass));assert.equal(wrong.observationMatches,false);
const conflict=run(presets.conflict,3);assert.deepEqual(conflict.feasible,[]);assert.deepEqual(conflict.soft,[2]);assert.deepEqual(conflict.conflicts,[['square','three']]);
assert.deepEqual(run(['positive','negative']).conflicts,[['positive','negative']]);
const zero=run(['square'],2,{...weights,square:0});assert.deepEqual(zero.soft,domain);assert.deepEqual(zero.feasible,[-2,2]);
// Exhaustively compare independently expressed predicates and penalties over all 16 rulebooks.
for(let mask=0;mask<16;mask++){const ids=rules.filter((_,i)=>mask&(1<<i)).map(r=>r.id);const a=run(ids);for(const x of domain){const truth=verify(x,ids).every(r=>r.pass);assert.equal(a.feasible.includes(x),truth);assert.equal(a.scores.find(p=>p.x===x).score===0,truth);}for(const s of a.conflicts){assert.equal(run(s).feasible.length,0);for(const id of s)assert(run(s.filter(i=>i!==id)).feasible.length>0);}}
for(const c of [{active:['bogus'],candidate:2,weights},{active:['square','square'],candidate:2,weights},{active:[],candidate:2.5,weights},{active:[],candidate:2,weights:{...weights,square:-1}}])assert.throws(()=>analyze(c));
console.log('Rule Lab: all scenario, exhaustive checker, conflict, zero-weight, and validation checks passed.');
