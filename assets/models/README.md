# 3D models — provenance & licenses

Both machines on `fusion.html` are built from open releases of the real device geometry,
not artistic approximations.

## iter_tokamak.glb — ITER magnet system
- **Source:** ITER Organization, "Make your own tokamak with 3D printing" official release
  (v2.0, Feb 2022) — mirrored at <https://archive.org/details/iter-3d-printable-tokamak>.
  Announcement: <https://www.iter.org/node/20687/make-your-own-tokamak-3d-printing>
- **Parts used:** `Toroidal_field_coil_a.stl` (instanced ×18), `Poloidal_field_coil_1…6.stl`,
  `Central_solenoid.stl`. The vacuum vessel / cryostat sectors (100 MB+ each) were skipped —
  the page shows the magnet cage.
- **Assembly:** parts ship print-plate-flat; they were re-assembled to the published PF coil
  centers (PF1 R3.94 z+7.56 … PF6 R4.29 z−7.56, meters) at the release's ~1:106 scale
  (9.44 units/m, calibrated from the 18 m central solenoid).
- **Plasma:** procedural D-shaped torus at ITER equilibrium parameters
  (R₀ = 6.2 m, a = 2.0 m, κ = 1.7, δ = 0.33).
- **License:** ITER released the files for personal/educational printing & use; this page is
  a personal educational essay with on-page attribution.

## w7x_stellarator.glb — Wendelstein 7-X
- **Source:** Proxima Fusion, `open_stellarator_models`
  <https://github.com/proximafusion/open_stellarator_models> — `scaled_w7x_stellarator.step`.
- **License:** MIT.
- **Parts used:** all 50 non-planar coils + the innermost twisted surface as the glowing
  plasma (solids 50–54 are nested plasma/vessel surfaces; the thinnest is used).

## saturn_v.glb — Saturn V
- **Source:** NASA 3D Resources <https://github.com/nasa/NASA-3D-Resources> (public domain).
  Currently unused (space card shows the Starship instead); kept as an alternate.

## starship.glb — SpaceX Starship full stack
- **Source:** procedural, built in `build/build_starship.py` from public dimensions
  (9 m dia, Ship 52 m + Super Heavy 71 m, ogive nose, fore/aft flaps, grid fins, tile side).
  No third-party assets — no license constraints.

## falcon9.glb — Falcon 9 full stack
- **Source:** "Falcon 9.stl" by Fac-tory-o, Wikimedia Commons
  <https://commons.wikimedia.org/wiki/File:Falcon_9.stl> — **CC BY-SA 4.0**.
  The assembled-stack half of the file was extracted, decimated and exported via
  `build/build_falcon9.py`; the derived GLB remains CC BY-SA 4.0 with attribution.

## tdrs.glb — NASA Tracking & Data Relay Satellite (C)
- **Source:** NASA 3D Resources <https://github.com/nasa/NASA-3D-Resources>
  (public domain), used unmodified. Stands in for orbital data infrastructure
  on the SpaceX analysis page.

## Rebuild
The pipeline lives in `build/`:
1. `step2stl.py` — tessellates the Proxima STEP into per-solid STLs (needs a Python 3.13 venv
   with `pip install cadquery-ocp`; Blender.app's bundled python works).
2. `build_glbs.py` — run with `blender -b --python build_glbs.py`; expects a sibling
   `models/` dir holding the downloaded `iter_*.stl` files and `w7x_parts/` from step 1.
   Assembles, welds, planar-dissolves + decimates, assigns materials, exports both GLBs.

Viewer: `assets/fusion-3d.js` (THREE r128 + `assets/vendor/GLTFLoader.js`), lazy-loaded,
drag-to-orbit, pauses offscreen, respects `prefers-reduced-motion`.
