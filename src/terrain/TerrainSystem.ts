import { Color3, Mesh, MeshBuilder, Scene } from '@babylonjs/core';
import { CollisionSystem } from '@physics/CollisionSystem';
import { AssetManager } from '@systems/AssetManager';

export class TerrainSystem {
  public readonly groundMesh: Mesh;

  constructor(scene: Scene, assets: AssetManager, collision: CollisionSystem) {
    this.groundMesh = MeshBuilder.CreateGround(
      'birparaBaseTerrain',
      { width: 2400, height: 2400, subdivisions: 64 },
      scene
    );
    this.groundMesh.receiveShadows = true;
    this.groundMesh.material = assets.getOrCreatePBRMaterial(
      'dooarsGroundMat',
      new Color3(0.31, 0.39, 0.25),
      0.94,
      0.0
    );

    collision.registerGroundMesh(this.groundMesh);
  }
}
