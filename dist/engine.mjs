export const REVISION='71d2724e9d5bee03913a5a0fd151255f0478feed';
export function validate(p){
 if(!p||![64,128,256,512].includes(p.n)||![0,1,2].includes(p.profile)||!Number.isFinite(p.a)||p.a< -1||p.a>1||!Number.isFinite(p.D)||p.D<.001||p.D>.02||!Number.isFinite(p.duration)||p.duration<.1||p.duration>3||!Number.isFinite(p.cfl)||p.cfl<.1||p.cfl>.45)throw Error('Use valid parameters within the displayed ranges.');return p;
}
export function initial(x,profile){if(profile===1)return .5+.4*Math.sin(2*Math.PI*x);if(profile===2)return x>=.2&&x<=.4?1:0;let y=0;for(let k=-2;k<=2;k++)y+=Math.exp(-(((x-.3+k)/.065)**2)/2);return y;}
export function simulate(e,params){
 const p=validate(params); if(!e.configure(p.n,p.a,p.D,p.cfl))throw Error('Solver rejected parameters.');
 const state=new Float64Array(e.memory.buffer,e.data_ptr(),p.n);
 // Midpoint quadrature computes finite-volume cell averages, including a sharp pulse.
 for(let i=0;i<p.n;i++){let value=0;for(let q=0;q<16;q++)value+=initial((i+(q+.5)/16)/p.n,p.profile);state[i]=value/16;}
 const frames=[state.slice()],times=[0];let steps=0;
 const start=performance.now();for(let f=1;f<=100;f++){const t=p.duration*f/100;const count=e.advance(t);if(count<0)throw Error('Numerical integration failed.');steps+=count;frames.push(state.slice());times.push(t);}
 return {params:{...p},frames,times,steps,dt:e.stable_dt(),elapsed:performance.now()-start,revision:REVISION};
}
