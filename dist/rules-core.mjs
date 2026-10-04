export const domain=Object.freeze([-4,-3,-2,-1,0,1,2,3,4]);
export const rules=Object.freeze([
 {id:'square',label:'x² = 4',penalty:x=>(x*x-4)**2},
 {id:'positive',label:'x > 0',penalty:x=>Math.max(0,1-x)**2},
 {id:'negative',label:'x < 0',penalty:x=>Math.max(0,x+1)**2},
 {id:'three',label:'x = 3',penalty:x=>(x-3)**2}
]);
export const presets={determined:['square','positive'],ambiguous:['square'],wrong:['square','negative'],conflict:['square','three'],empty:[]};
export function validate(c){if(!c||!Array.isArray(c.active)||new Set(c.active).size!==c.active.length||c.active.some(id=>!rules.some(r=>r.id===id)))throw Error('Unknown or duplicate rule.');if(!domain.includes(c.candidate))throw Error('Candidate must be an integer from −4 to 4.');for(const r of rules)if(!Number.isInteger(c.weights?.[r.id])||c.weights[r.id]<0||c.weights[r.id]>10)throw Error('Every weight must be an integer from 0 to 10.');return c;}
// Independent Boolean checker: never infer validity from a small loss.
export function verify(x,active){const facts={square:x*x===4,positive:x>0,negative:x<0,three:x===3};return active.map(id=>({id,pass:facts[id]===true}));}
export function analyze(config){const c=validate(config),selected=rules.filter(r=>c.active.includes(r.id));const scores=domain.map(x=>({x,score:selected.reduce((s,r)=>s+c.weights[r.id]*r.penalty(x),0)}));const min=Math.min(...scores.map(p=>p.score));const feasible=domain.filter(x=>verify(x,c.active).every(r=>r.pass));const soft=scores.filter(p=>p.score===min).map(p=>p.x);const conflicts=[];for(let mask=1;mask<2**c.active.length;mask++){const ids=c.active.filter((_,i)=>mask&(1<<i));if(!domain.some(x=>verify(x,ids).every(r=>r.pass))&&!conflicts.some(s=>s.every(id=>ids.includes(id))))conflicts.push(ids);}return{scores,min,soft,feasible,conflicts,checks:verify(c.candidate,c.active),observationMatches:c.candidate===2,status:feasible.length===0?'Inconsistent':feasible.length===1?'Unique in this domain':'Underdetermined'};}
