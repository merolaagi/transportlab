/* Custom, unverified periodic finite-volume driver using unchanged upstream kernels. */
#define main upstream_main
#include "vendor/advection_diffusion_iso_1d.c"
#undef main
#define MAX_N 512
static double u[MAX_N], stage[MAX_N], rhs1[MAX_N], rhs2[MAX_N];
static double left[MAX_N], right[MAX_N], flux[MAX_N];
static int n;
static double velocity, diffusion, dx, safety, sim_time;

__attribute__((export_name("configure")))
int configure(int count, double a, double D, double cfl) {
  if(count<32 || count>MAX_N || !isfinite(a) || fabs(a)>1 || !isfinite(D) || D<0.001 || D>0.02 || !isfinite(cfl) || cfl<0.1 || cfl>0.45) return 0;
  n=count; velocity=a; diffusion=D; safety=cfl; dx=1.0/n; sim_time=0; return 1;
}
__attribute__((export_name("data_ptr"))) double* data_ptr(void){return u;}
__attribute__((export_name("current_time"))) double current_time(void){return sim_time;}
__attribute__((export_name("stable_dt"))) double stable_dt(void){return safety/(fabs(velocity)/dx+2.0*diffusion/(dx*dx));}
static void rhs(double* values, double* result) {
  advection_diffusion_iso_1d_parameters P={velocity,diffusion};
  for(int i=0;i<n;i++) {
    int l=(i+n-1)%n,r=(i+1)%n;
    advection_diffusion_iso_1d_coordinates CL={(i-0.5)*dx}, C={(i+0.5)*dx}, CR={(i+1.5)*dx};
    advection_diffusion_iso_1d_state UL={values[l]},U={values[i]},UR={values[r]};
    advection_diffusion_iso_1d_minmod_reconstruction L,R;
    advection_diffusion_iso_1d_minmod_x_left_reconstruction(&CL,&C,&CR,&UL,&U,&UR,&P,&L);
    advection_diffusion_iso_1d_minmod_x_right_reconstruction(&CL,&C,&CR,&UL,&U,&UR,&P,&R);
    left[i]=L.reconstruction_f;right[i]=R.reconstruction_f;
  }
  for(int i=0;i<n;i++) {
    int j=(i+1)%n;
    advection_diffusion_iso_1d_coordinates CL={(i+0.5)*dx}, CR={(i+1.5)*dx};
    advection_diffusion_iso_1d_state L={right[i]},R={left[j]},UL={values[i]},UR={values[j]};
    advection_diffusion_iso_1d_flux FL,FR;
    advection_diffusion_iso_1d_wavespeed W;
    advection_diffusion_iso_1d_x_flux(&CL,&P,&L,&FL);
    advection_diffusion_iso_1d_x_flux(&CR,&P,&R,&FR);
    advection_diffusion_iso_1d_x_wavespeed(&CL,&P,&L,&W);
    advection_diffusion_iso_1d_centered_diffusion_interface_gradient G;
    advection_diffusion_iso_1d_centered_diffusion_x_interface_gradient(&CL,&CR,&UL,&UR,&P,&G);
    advection_diffusion_iso_1d_gradient DU={G.interface_f_x};
    advection_diffusion_iso_1d_diffusive_flux DF;
    advection_diffusion_iso_1d_x_diffusive_flux(&CL,&P,&UL,&DU,&DF);
    flux[i]=0.5*(FL.flux_f+FR.flux_f)-0.5*fabs(W.mu1)*(R.f-L.f)-DF.diffusive_flux_f;
  }
  for(int i=0;i<n;i++) result[i]=-(flux[i]-flux[(i+n-1)%n])/dx;
}
__attribute__((export_name("advance")))
int advance(double target) {
  if(n==0 || !isfinite(target) || target<sim_time || target>3) return -1;
  int steps=0; double max_dt=stable_dt();
  while(sim_time<target-1e-14) {
    double dt=fmin(max_dt,target-sim_time);
    rhs(u,rhs1);
    for(int i=0;i<n;i++) stage[i]=u[i]+dt*rhs1[i];
    rhs(stage,rhs2);
    for(int i=0;i<n;i++){u[i]=0.5*u[i]+0.5*(stage[i]+dt*rhs2[i]); if(!isfinite(u[i])) return -2;}
    sim_time+=dt;steps++;
  }
  sim_time=target;return steps;
}
