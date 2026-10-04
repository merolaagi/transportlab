# Transport Lab

A working educational and research web app for **1D isotropic advection–diffusion**. Both modes use the same original Lanyon C kernels compiled to WebAssembly. All simulations run locally in a Web Worker; no simulation inputs are sent to a server. Runs and pinned comparisons are tab-local and disappear on reload.

Live app: https://transportlab.fueldeskpro.com (owner sign-in required).

The custom domain is active with HTTPS. Original Sites URL: https://transport-lab-lanyon.aps-bht.chatgpt.site. The website remains owner-private; the source repository is public.

## Use

First fetch and build the upstream dependency using the Rebuild instructions below. Then run `python3 preview.py` from this directory. It prints the project-specific local URL and records its assigned port. Open that URL, run experiments, animate or scrub the timeline, switch to Research for grid/time controls, pin a comparison, or export CSV and configuration JSON. After building, the static `dist/` directory is ready to host, including `solver.wasm`.

## Numerical method and limits

- Equation: u_t + a u_x = D u_xx on the dimensionless domain [0, 1], periodic boundaries.
- 64–512 finite-volume cells; velocities from −1 to 1; positive diffusion from 0.001 to 0.02; end times from 0.1 to 3.
- Original upstream functions supply minmod reconstruction, physical flux, wave speed, centered interface gradient, and diffusive flux.
- Custom driver assembles Rusanov advective flux and centered diffusive flux, then advances with SSP-RK2.
- Time step ≤ safety / (|a|/dx + 2 D/dx²), shortened to land exactly on the 100 output intervals. Safety is 0.1–0.45.
- Gaussian initial pulse: periodic sum with center 0.3, standard deviation 0.065, peak approximately 1. Sine: 0.5 + 0.4 sin(2πx). Square: 1 on [0.2, 0.4], 0 elsewhere. Initial cell averages use 16 midpoint samples per cell.
- Plot values are cell averages at cell centers. Mass drift is absolute change in domain integral. Pinned plots interpolate between stored output times and only appear within their own time interval.
- Sine-wave L₂ errors compare numerical results with analytic **cell averages**, not point samples.

## Source and verification boundary

Fetched unchanged from https://github.com/lanyonai/AdvectionDiffusion at revision `71d2724e9d5bee03913a5a0fd151255f0478feed`:

- `vendor/advection_diffusion_iso_1d.c`
- `vendor/advection_diffusion_iso_1d.lean`

Upstream's C file has an empty simulation `main`. `driver.c` includes it unchanged (renaming that entry point) and implements the simulation loop. We did not rerun or independently audit the Lean proofs. They describe real-valued mathematical properties; this app does **not** claim that the browser, IEEE floating-point execution, WebAssembly compilation, custom driver, or whole simulation has been formally verified. This app is independent of Lanyon AI.

No license file was present in the selected upstream revision. Therefore this public repository excludes the upstream C/Lean files and compiled solver binary. `fetch-upstream.py` downloads the pinned dependencies locally and verifies SHA-256 hashes. Fetched files and generated binaries are ignored by Git. This repository does not grant rights to upstream code; review its terms before redistribution.

## Rebuild

The published app’s WebAssembly binary was built with official WASI SDK 34.0, with optimization `-O2`, no fast-math, no imports, and a fixed 256 KiB memory. Obtain WASI SDK from https://github.com/WebAssembly/wasi-sdk/releases and run:

```sh
python3 fetch-upstream.py
WASI_SDK_PATH=/absolute/path/to/wasi-sdk sh build.sh
node tests/numerics.mjs
```

`build.sh` regenerates the binary and copies the original kernel source into the public output. No npm dependencies are required.

## Validation performed

The numerical suite checks grid convergence against an exact sine-wave solution, mass conservation to 1e-12, finite values and concentration bounds across zero and reversed velocities, low/high diffusion, all three profiles, and rejection of invalid parameters.

At t=0.5, a=0.5, D=0.005, errors for 64/128/256 cells were approximately 1.562e-3 / 3.902e-4 / 9.709e-5.

Browser checks exercised Research mode, grid changes, timeline endpoint, pinned comparison, and valid/invalid WebMCP runs. Exports contain all 101 frames as CSV plus a separate JSON record of parameters and provenance.

## Learn with physics

`dist/pinn.html` is an independent browser training experiment inspired by Ben Moseley's PINN tutorial and 2022 Oxford thesis. It uses **new JavaScript code**, not copied tutorial code or the Lanyon kernel, and works without fetching upstream dependencies.

Both models have one hidden layer with 32 tanh neurons and periodic inputs `(sin(2πx), cos(2πx), 2t−1)`. They share initial weights, sparse observations in t∈[0,0.25], and 32 clean initial-condition samples. The experiment fixes v=0.5 and D=0.01. The exact pointwise solution is `0.5 + 0.4 exp(−4π²Dt) sin(2π(x−vt))`.

Adam (learning rate 0.003) minimizes data MSE + initial MSE in the ordinary NN. The PINN also minimizes λ times the differential-equation residual MSE on 48 newly sampled collocation points per step. Input derivatives and parameter gradients are analytic, tested against finite differences, and include the second spatial derivative. Periodicity is enforced through input encoding in both models. Residual diagnostics use a fixed 16×16 grid; fields and exact errors use 64 positions and 21 time slices. Unobserved-time RMSE uses t>0.25. Compute-time measurements cover loss/gradient evaluation and optimizer updates, excluding snapshots, plotting, and replay. Timing is device-dependent and is not a controlled performance benchmark.

Observation noise is the sum of six centered uniforms scaled to the selected standard deviation; it is approximately Gaussian, not exactly Gaussian. There is no full-field exact-solution supervision. Multiple seeds and configurable data/noise/physics weights help reveal sensitivity. PINN training has no guaranteed convergence and is not a formal verification method.

Run `node tests/pinn.mjs` to check all parameter gradients, PDE residual derivatives, full loss gradients, periodicity, exact equality at λ=0, three-seed convergence, and invalid inputs. Training checkpoints, loss curves, PDE residual maps, and run metadata can be exported as JSON. The page exposes an optional validated WebMCP training action.

## Rule Lab

Open `rules.html` to compare weighted penalties, exact finite-domain constraints, and a separate Boolean checker. Five presets demonstrate sufficient, missing, incorrect, conflicting, and absent rules. The domain is explicitly the nine integers from −4 through 4. The synthetic held-out observation is x = +2; it does not enter either objective or constraints. All tied minimizers and satisfying candidates are shown. Minimal conflicting rule sets are enumerated.

This is an exact symbolic teaching sandbox, not a neural network or formal proof assistant. The separate PINN page trains actual neural networks. Rule Lab distinguishes consistency, uniqueness within a declared domain, and agreement with observations.

Run `node tests/rules.mjs` for scenario tests, exhaustive checks over all 16 rulebooks, minimal conflicts, zero-weight behavior, and input validation. The optional WebMCP tool `explore_rulebook` uses the same validated controls and updates the visible experiment.
