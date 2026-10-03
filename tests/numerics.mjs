import fs from 'node:fs';import assert from 'node:assert/strict';import {simulate,validate} from '../dist/engine.mjs';
const {instance}=await WebAssembly.instantiate(fs.readFileSync(new URL('../dist/solver.wasm',import.meta.url)),{});const e=instance.exports;e._initialize();
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;let errors=[];
for(const n of [64,128,256]){const p={n,a:.5,D:.005,duration:.5,cfl:.4,profile:1};const r=simulate(e,p);const exact=(i)=>.5+.4*Math.sin(Math.PI/n)/(Math.PI/n)*Math.exp(-4*Math.PI**2*p.D*p.duration)*Math.sin(2*Math.PI*((i+.5)/n-p.a*p.duration));const last=r.frames[100];const err=Math.sqrt(last.reduce((s,v,i)=>s+(v-exact(i))**2,0)/n);errors.push(err);assert.ok(Math.abs(mean(last)-mean(r.frames[0]))<1e-12);console.log({n,L2:err,steps:r.steps});}
assert.ok(errors[2]<errors[1]&&errors[1]<errors[0]);assert.ok(errors[2]<.001);
for(const a of [-1,0,1])for(const D of [.001,.02])for(const profile of [0,1,2]){const r=simulate(e,{n:128,a,D,profile,duration:1,cfl:.45});const last=r.frames[100];assert.ok(last.every(Number.isFinite));assert.ok(Math.min(...last)>-1e-10);assert.ok(Math.max(...last)<=Math.max(...r.frames[0])+1e-10);assert.ok(Math.abs(mean(last)-mean(r.frames[0]))<1e-12);}
const p={n:64,a:0,D:.01,duration:.1,cfl:.4,profile:0};for(const bad of [{...p,D:0},{...p,n:2048},{...p,a:NaN},{...p,duration:4}])assert.throws(()=>validate(bad));
console.log('PASS: convergence, mass conservation, finite values, bounds, zero/reversed flow, invalid inputs.');
