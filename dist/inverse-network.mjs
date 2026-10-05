// Original analytic-gradient PINN implementation. No external ML dependency.
const K=2*Math.PI, H=32, SIZE=1+5*H;
export function rng(seed){let s=seed>>>0;return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
export function exact(x,t){return .5+.4*Math.exp(-K*K*.01*t)*Math.sin(K*(x-.5*t));}
export function validateConfig(p){if(!p||!Number.isInteger(p.samples)||p.samples<4||p.samples>64||!Number.isInteger(p.steps)||p.steps<100||p.steps>5000||!Number.isInteger(p.seed)||p.seed<1||p.seed>9999||!Number.isFinite(p.weight)||p.weight<0||p.weight>10||!Number.isFinite(p.noise)||p.noise<0||p.noise>.1)throw Error('Choose valid training settings within the displayed ranges.');return p;}
export function createModel(seed){const random=rng(seed);const p=new Float64Array(SIZE);p[0]=.5;for(let j=0;j<H;j++){let i=1+5*j;p[i]=(random()-.5)*.2;for(let k=1;k<5;k++)p[i+k]=(random()-.5)*2;}return {p,m:new Float64Array(SIZE),v:new Float64Array(SIZE),iteration:0};}
export function evaluate(p,x,t,derivatives=false,v=.5,D=.01){let u=p[0],r=0,ux=0,uxx=0;const gu=derivatives?new Float64Array(SIZE):null,gr=derivatives?new Float64Array(SIZE):null;if(gu)gu[0]=1;const sn=Math.sin(K*x),cs=Math.cos(K*x),tm=2*t-1;
 for(let j=0;j<H;j++){const i=1+5*j,w=p[i],A=p[i+1],B=p[i+2],C=p[i+3],E=p[i+4];const z=A*sn+B*cs+C*tm+E,h=Math.tanh(z),s=1-h*h,zx=K*(A*cs-B*sn),zxx=-K*K*(A*sn+B*cs),q=2*C+v*zx-D*zxx,R=s*q+2*D*h*s*zx*zx;u+=w*h;r+=w*R;ux+=w*s*zx;uxx+=w*(s*zxx-2*h*s*zx*zx);
 if(gu){gu[i]=h;gu[i+1]=w*s*sn;gu[i+2]=w*s*cs;gu[i+3]=w*s*tm;gu[i+4]=w*s;
 const rz=w*(-2*h*s*q+2*D*(s*s-2*h*h*s)*zx*zx),rx=w*(v*s+4*D*h*s*zx),rxx=-D*w*s;gr[i]=R;gr[i+1]=rz*sn+rx*K*cs-rxx*K*K*sn;gr[i+2]=rz*cs-rx*K*sn-rxx*K*K*cs;gr[i+3]=rz*tm+2*w*s;gr[i+4]=rz;}}
 return{u,r,ux,uxx,gu,gr};}
