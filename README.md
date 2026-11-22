# BIRPARA

A browser-based 3D open-world geographic reconstruction of **Birpara, West Bengal, India**, built with **Babylon.js**, **TypeScript**, and **Vite**.

## Milestone 001 Scope

- Establish a modular, open-world-ready TypeScript + Babylon.js architecture.
- Reconstruct the real geography, road network, and architectural character of Birpara from reference imagery (starting at **Birbity**).
- Implement a temporary upright 3D cylinder player controller (WASD / Arrow keys, walk/run, gravity, terrain-following, solid collisions).
- Implement a modern third-person follow camera with smooth orbit, pitch limits, adjustable distance/height, and collision avoidance.
- **Strictly excluded from Milestone 001:** vehicles, traffic, NPCs, missions, combat, economy, multiplayer, and human character modeling.

## Technology Stack

- **3D Engine:** Babylon.js (`@babylonjs/core`, `@babylonjs/loaders`)
- **Language:** TypeScript (WebGL rendering)
- **3D Asset Format:** GLB / GLTF
- **Build Tool:** Vite

## Project Structure

```text
BIRPARA/
├── src/
│   ├── core/          # Engine bootstrap, scene lifecycle, global config, metric geo-projection
│   ├── world/         # World manager, district streaming registry, LOD & frustum culling rules
│   ├── terrain/       # Heightfield terrain, elevation slopes, tea-garden ground surfaces
│   ├── roads/         # Real-world road splines, intersections, shoulders, drainage
│   ├── buildings/     # Modular residential/commercial structures & GLB asset instancing
│   ├── districts/     # Independent geographical sections (Birbity, Market, Chawpatti, etc.)
│   ├── vegetation/    # Instanced Dooars shade trees, roadside flora, tea bushes
│   ├── player/        # Temporary cylinder controller, movement, gravity, ground detection
│   ├── camera/        # Third-person follow camera with collision raycasting
│   ├── physics/       # Collision detection, ground raycasting, solid obstacle bounds
│   ├── controls/      # Keyboard & mouse input manager (WASD, Arrows, Pointer Lock / Orbit)
│   ├── ui/            # Minimal exploration HUD (district indicator, coordinates, camera controls)
│   └── systems/       # Natural daylight/shadows, asset caching, performance diagnostics
├── public/
│   └── assets/
│       ├── models/        # Original GLB/GLTF 3D models
│       ├── textures/      # PBR textures (asphalt, plaster, corrugated tin, foliage)
│       └── environment/   # Sky/IBL lighting assets
└── docs/
    ├── geography/     # Real-world coordinates, district baselines, reference tracker
    ├── architecture/  # Technical architecture, coordinate system, streaming & LOD design
    └── development/   # Milestone roadmap, testing checklist, trade-off log
```

## Primary Geographical Sections

1. **Birbity** *(Player Spawn)*
2. **Birpara Market**
3. **Chawpatti**
4. **Old Bus Stand**
5. **Hospital Road**
6. **Subhaspally**
7. **College Road**
8. **Upar Basty**
9. **Surrounding connecting roads, residential colonies, and tea garden landscapes**

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Asset & Reference Policy

All 3D geometry and textures are modelled and authored independently from visual observation of reference photography and maps. Proprietary third-party 3D map tiles or Street View imagery are never extracted or redistributed as game assets.
