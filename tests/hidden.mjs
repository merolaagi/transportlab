import assert from 'node:assert/strict';
import{generate,fitClassical,createTraining,step,objective,evaluate,exportModel,predictModel,score}from '../dist/hidden-core.mjs';
import{createModel}from '../dist/inverse-network.mjs';
const c={seed:1,samples:32,noise:0,steps:1000,design:'spread'},e=generate(c),f=fitClassical(e.obs,0);assert(Math.abs(f.v-e.truth.v)<.001);assert(Math.abs(f.D-e.truth.D)<.0001);
const zero=generate({...c,design:'initial'}),z=fitClassical(zero.obs,0);assert(z.nonIdentifiable);assert.deepEqual(z.range.v,[-1,1]);assert.deepEqual(z.range.D,[.001,.05]);
// Gradient checks for network parameters and both unknown physical coefficients.
const p=createModel(4).p,pts=[{x:.17,t:.43},{x:.62,t:.82}],v=-.31,D=.024,eps=1e-6,l=objective(p,e.obs,pts,v,D,.1);
for(const i of[0,1,2,3,4,5,45,160]){const pp=p.slice(),pm=p.slice();pp[i]+=eps;pm[i]-=eps;const n=(objective(pp,e.obs,pts,v,D,.1).total-objective(pm,e.obs,pts,v,D,.1).total)/(2*eps);assert(Math.abs(n-l.g[i])<1e-6,`weight ${i}`);}
const gv=(objective(p,e.obs,pts,v+eps,D,.1).total-objective(p,e.obs,pts,v-eps,D,.1).total)/(2*eps),gd=(objective(p,e.obs,pts,v,D*Math.exp(eps),.1).total-objective(p,e.obs,pts,v,D*Math.exp(-eps),.1).total)/(2*eps);assert(Math.abs(gv-l.gv)<1e-6);assert(Math.abs(gd-l.glogD)<1e-6);
for(const seed of[1,2,3]){const data=generate({...c,seed,noise:.01,samples:16}),fit=fitClassical(data.obs,.01),ex=createTraining(data.obs,seed);for(let i=0;i<3000;i++)step(ex);const model=JSON.parse(JSON.stringify(exportModel(ex,fit,{...c,seed})));assert.equal(predictModel(model,'pinn',.3,.8),evaluate(ex.pinn.p,.3,.8).u);assert(model.parameters.D>0);assert(Math.abs(evaluate(ex.pinn.p,0,.7).u-evaluate(ex.pinn.p,1,.7).u)<1e-12);const scores=Object.fromEntries(['nn','pinn','classical'].map(k=>[k,score((x,t)=>predictModel(model,k,x,t),data.truth).forecastRMSE]));assert(Object.values(scores).every(Number.isFinite));console.log({seed,truth:data.truth,estimated:model.parameters,scores});}
console.log('Hidden physics: parameter recovery, identifiability, gradients, export inference, periodicity and 3-seed training passed.');
