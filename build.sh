#!/bin/sh
set -eu
cd "$(dirname "$0")"
: "${WASI_SDK_PATH:?Set WASI_SDK_PATH to your WASI SDK directory}"
"$WASI_SDK_PATH/bin/clang" driver.c -O2 -mexec-model=reactor -Wl,--initial-memory=262144 -Wl,--max-memory=262144 -o dist/solver.wasm
cp vendor/advection_diffusion_iso_1d.c dist/kernels.c
