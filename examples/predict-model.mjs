// node examples/predict-model.mjs /path/to/downloaded-model.json 0.3 0.75
import {readFile} from 'node:fs/promises';
import {predictModel} from '../dist/hidden-core.mjs';
const [file,xText='0.3',tText='0.75']=process.argv.slice(2);
if(!file)throw Error('Pass the JSON model downloaded from Hidden Physics, then optional x and t.');
const model=JSON.parse(await readFile(file,'utf8')),x=Number(xText),t=Number(tText);
console.log({x,t,predictions:Object.fromEntries(['nn','pinn','classical'].map(kind=>[kind,predictModel(model,kind,x,t)]))});
