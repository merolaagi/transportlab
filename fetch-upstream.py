#!/usr/bin/env python3
"""Fetch pinned upstream dependencies locally; no redistribution license is implied."""
from pathlib import Path
from urllib.request import urlopen
import hashlib
ROOT = Path(__file__).resolve().parent
REVISION = '71d2724e9d5bee03913a5a0fd151255f0478feed'
FILES = {
 'implementations/advection_diffusion_iso_1d.c': '891f525a03e0685c0e4a5e738388ba16267356ce6552ac0cb9d319fe731605e3',
 'proofs/advection_diffusion_iso_1d.lean': 'f9d4fa985f6c2c74eedaff4a6240503d8103e1065a8a0ee8fa7e1f02478443ae',
}
(ROOT/'vendor').mkdir(exist_ok=True)
for path, expected in FILES.items():
 with urlopen(f'https://raw.githubusercontent.com/lanyonai/AdvectionDiffusion/{REVISION}/{path}', timeout=30) as response:
  data = response.read()
 if hashlib.sha256(data).hexdigest() != expected:
  raise SystemExit(f'Checksum mismatch: {path}')
 destination = ROOT/'vendor'/Path(path).name
 destination.write_bytes(data)
 print(f'Fetched and verified {destination.name}')
