# BIRPARA — Technical Architecture (Milestone 001)

## 1. Engine & Coordinate System

- **Engine:** Babylon.js (WebGL2 with WebGL1 fallback), left-handed Y-up coordinate system.
- **Scale:** `1 world unit = 1.0 real-world meter`.
- **World Origin `(0, 0, 0)`:** Anchored at **Birbity** (exact spawn coordinates to be locked once Birbity reference screenshots are confirmed).
  - `+X` = East
  - `-X` = West
  - `+Z` = North (toward Bhutan foothills / College Road / Birpara Tea Garden)
  - `-Z` = South (toward NH17 / Chawpatti)
  - `+Y` = Up (elevation in meters above local datum)

## 2. Modular World Streaming & Optimization Strategy

Each neighborhood in Birpara is encapsulated as an independent `DistrictSection` inside `src/districts/`:

- **Frustum Culling:** Babylon.js native bounding-box/sphere frustum culling enabled on all static meshes and `TransformNode` district roots.
- **Distance-Based LOD:** Buildings and vegetation register multi-tier LOD levels (`addLODLevel`) — full architectural trim near the player, simplified silhouette at mid-range, culled beyond horizon threshold.
- **Asset Caching & Instancing:** `src/systems/AssetManager.ts` caches loaded `.glb`/`.gltf` containers and PBR materials so shared textures, utility poles, trees, and tea bushes use `ThinInstance` or `InstancedMesh` with zero duplicate network fetches.
- **Chunk / District Streaming:** `src/world/WorldManager.ts` loads/activates district roots based on distance from the player while keeping terrain and primary road corridors persistent.

## 3. Player & Camera Architecture

- **Temporary Player (`src/player/PlayerController.ts`):**
  - Upright 3D cylinder (`height: 1.75m`, `radius: 0.35m`), high-contrast matte finish for clear visual readability.
  - Camera-relative WASD & Arrow-key movement, smooth yaw alignment toward movement direction, walk (`1.6 m/s`) and run (`4.8 m/s`, Shift) speeds.
  - Gravity (`-9.81 m/s²`), downward ground raycast for terrain-following, and horizontal cylinder collision sweep against solid building/wall colliders.
- **Third-Person Camera (`src/camera/ThirdPersonCamera.ts`):**
  - Smooth damped follow target anchored at player shoulder height.
  - Mouse-controlled yaw/pitch with vertical pitch clamps (`-15°` to `+65°`), scroll-wheel distance adjustment, and height offset controls.
  - Raycast collision check from pivot to desired camera position so the camera pulls forward instead of clipping inside buildings or terrain.
