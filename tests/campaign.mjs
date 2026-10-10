import assert from 'node:assert/strict';
import{writeFileSync}from 'node:fs';
import{startingModel,validateCampaign,runCampaign}from '../dist/campaign-core.mjs';
const study=runCampaign({seeds:6,steps:1000,noise:.01,firstSeed:1});
if(process.argv[2])writeFileSync(process.argv[2],JSON.stringify(study));
assert.equal(study.runs.length,24);assert.equal(new Set(study.protocol.discoverySeeds.filter(s=>study.protocol.confirmationSeeds.includes(s))).size,0);
for(const seed of study.protocol.discoverySeeds.concat(study.protocol.confirmationSeeds)){const runs=study.runs.filter(r=>r.seed===seed);for(const r of runs){assert.equal(r.checkpoints.length,5);assert(Number.isFinite(r.metrics.forecastRMSE));assert.deepEqual(r.observations,runs[0].observations);}for(const r of runs.slice(0,3))assert.deepEqual(r.checkpoints[0].weights,runs[0].checkpoints[0].weights);}
const donor=study.runs.find(r=>r.seed===1&&r.condition==='correct').checkpoints.at(-1).weights;
for(const seed of study.protocol.confirmationSeeds){const p=startingModel(seed,donor,false).p,q=startingModel(seed,donor,true).p;for(let k=1;k<=4;k++){const col=a=>Array.from({length:32},(_,j)=>a[1+5*j+k]).sort((a,b)=>a-b);assert.deepEqual(col(p),col(q));}assert.notDeepEqual(p,q);}
assert.throws(()=>validateCampaign({seeds:5,steps:1000,noise:.01,firstSeed:1}));
console.log('PASS: matched initializations/observations, disjoint seeds, checkpoints, finite outcomes and scramble control.');
