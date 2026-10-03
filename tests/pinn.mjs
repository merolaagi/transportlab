import assert from 'node:assert/strict';
import{createModel,evaluate,createExperiment,trainStep,snapshot,loss,dataset,validateConfig}from '../dist/pinn-core.mjs';
const cfg={seed:1,samples:16,steps:2000,weight:.1,noise:0};
const model=createModel(4),p=model.p,x=.27,t=.63,h=1e-5;
const z=evaluate(p,x,t,true);for(let i=0;i<p.length;i++){const v=p[i];p[i]=v+h;const a=evaluate(p,x,t);p[i]=v-h;const b=evaluate(p,x,t);p[i]=v;assert.ok(Math.abs((a.u-b.u)/(2*h)-z.gu[i])<1e-7,`u gradient ${i}`);assert.ok(Math.abs((a.r-b.r)/(2*h)-z.gr[i])<1e-6,`r gradient ${i}`);}
const ut=(evaluate(p,x,t+h).u-evaluate(p,x,t-h).u)/(2*h),ux=(evaluate(p,x+h,t).u-evaluate(p,x-h,t).u)/(2*h),uxx=(evaluate(p,x+h,t).u-2*z.u+evaluate(p,x-h,t).u)/(h*h);assert.ok(Math.abs(z.r-(ut+.5*ux-.01*uxx))<1e-6);
const d=dataset(cfg),pts=[{x:.2,t:.4},{x:.7,t:.8}],L=loss(p,d,pts,.1);for(let i=0;i<p.length;i++){const v=p[i];p[i]=v+h;const a=loss(p,d,pts,.1,false).total;p[i]=v-h;const b=loss(p,d,pts,.1,false).total;p[i]=v;assert.ok(Math.abs((a-b)/(2*h)-L.g[i])<1e-6,`loss gradient ${i}`);}
assert.ok(Math.abs(evaluate(p,0,.7).u-evaluate(p,1,.7).u)<1e-12);
let zero=createExperiment({...cfg,weight:0});for(let i=0;i<100;i++)trainStep(zero);assert.deepEqual(zero.nn.p,zero.pinn.p);
for(const seed of [1,2,3]){const e=createExperiment({...cfg,seed});for(let i=0;i<2000;i++)trainStep(e);const s=snapshot(e);assert.ok(s.pinn.heldRMSE<.04);assert.ok(s.pinn.heldRMSE<s.nn.heldRMSE);assert.ok(s.pinn.field.every(Number.isFinite));console.log({seed,nn:s.nn.heldRMSE,pinn:s.pinn.heldRMSE,physics:s.pinn.l.physics});}
for(const p of [{...cfg,noise:NaN},{...cfg,seed:0},{...cfg,weight:-1}])assert.throws(()=>validateConfig(p));
console.log('PASS: analytic derivatives, full loss gradients, periodicity, zero-weight equality, three-seed convergence, input validation.');
