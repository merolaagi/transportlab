import{runCampaign}from './campaign-core.mjs';
self.onmessage=({data})=>{try{const result=runCampaign(data,p=>self.postMessage({progress:p}));self.postMessage({done:true,result});}catch(e){self.postMessage({error:e.message});}};
