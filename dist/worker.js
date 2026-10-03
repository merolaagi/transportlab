import {simulate} from './engine.mjs';
let engine;const ready=(async()=>{const response=await fetch('./solver.wasm');if(!response.ok)throw Error('Solver download failed.');const {instance}=await WebAssembly.instantiate(await response.arrayBuffer(),{});engine=instance.exports;engine._initialize?.();})();
self.onmessage=async({data})=>{try{await ready;const result=simulate(engine,data);self.postMessage({result},result.frames.map(f=>f.buffer));}catch(e){self.postMessage({error:e.message});}};
