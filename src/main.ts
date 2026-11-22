import { Vector3 } from '@babylonjs/core';
import { ThirdPersonCamera } from '@camera/ThirdPersonCamera';
import { InputManager } from '@controls/InputManager';
import { EngineApp } from '@core/EngineApp';
import { CollisionSystem } from '@physics/CollisionSystem';
import { PlayerController } from '@player/PlayerController';
import { AssetManager } from '@systems/AssetManager';
import { LightingSystem } from '@systems/LightingSystem';
import { ExplorationHUD } from '@ui/ExplorationHUD';
import { WorldManager } from '@world/WorldManager';

const canvas = document.getElementById('renderCanvas');
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Missing #renderCanvas element.');
}

const app = new EngineApp(canvas);
const lighting = new LightingSystem(app.scene);
const assets = new AssetManager(app.scene);
const collision = new CollisionSystem(app.scene);
const world = new WorldManager(app.scene, assets, lighting, collision);
const input = new InputManager(canvas);

const spawnOrigin = new Vector3(0, 0, 0);
const player = new PlayerController(app.scene, assets, lighting, collision, spawnOrigin);
const camera = new ThirdPersonCamera(app.scene, collision, spawnOrigin);
const hud = new ExplorationHUD();

app.addUpdater((dt) => {
  player.update(dt, input, camera.getYaw());
  const state = player.getState();
  camera.update(dt, state.position, input);
  world.updateStreaming(state.position);
  hud.update(state, camera.getSettings(), world.getActiveDistrict(state.position), input.pointerLocked);
});

app.start();
