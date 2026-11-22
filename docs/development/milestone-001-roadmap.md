# Milestone 001 — Incremental Development Roadmap

## Phase 1: Repository & Architecture Foundation
- [x] Create `kaizen-flims/BIRPARA` repository on GitHub.
- [x] Establish modular `src/`, `public/assets/`, and `docs/` directory layout.
- [x] Configure Vite, TypeScript strict mode, and Babylon.js (`@babylonjs/core`, `@babylonjs/loaders`).
- [x] Document coordinate system, streaming/LOD design, and geographic reference tracker.

## Phase 2: Core Exploration Engine
- [ ] Implement `src/core/` (Engine, Scene, GeoProjection).
- [ ] Implement `src/systems/` (Natural Dooars daylight, shadows, AssetManager).
- [ ] Implement `src/controls/`, `src/physics/`, `src/player/` (upright cylinder spawning in Birbity), and `src/camera/` (third-person follow camera with collision).
- [ ] Verify smooth movement, gravity, terrain-following, and solid wall collision in browser.

## Phase 3: Reference-Driven Birpara Reconstruction
- [ ] Reconstruct **Birbity** (spawn district) from reference screenshots first.
- [ ] Connect primary road network (**Birbity -> Old Bus Stand / Chawpatti -> Birpara Market -> Hospital Road -> Subhaspally -> College Road -> Upar Basty**).
- [ ] Add instanced vegetation (shade trees, tea bushes) and street infrastructure (poles, drains, culverts).

## Phase 4: Milestone 001 Verification & Release
- [ ] Run full TypeScript + Vite production build check.
- [ ] Verify walkable traversal across all reconstructed areas with zero fall-through or clipping bugs.
- [ ] Tag and push Milestone 001 release to `BIRPARA`.
