import{createExperiment,trainStep,snapshot}from './pinn-core.mjs';
self.onmessage=({data})=>{try{const e=createExperiment(data);self.postMessage(snapshot(e));while(e.step<data.steps){for(let i=0;i<25&&e.step<data.steps;i++)trainStep(e);if(e.step%100===0||e.step===data.steps)self.postMessage(snapshot(e));}self.postMessage({done:true});}catch(e){self.postMessage({error:e.message});}};
