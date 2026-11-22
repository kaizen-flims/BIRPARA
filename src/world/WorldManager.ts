import { Scene, Vector3 } from '@babylonjs/core';
import { DistrictDefinition, DistrictRegistry } from '@districts/DistrictRegistry';
import { CollisionSystem } from '@physics/CollisionSystem';
import { AssetManager } from '@systems/AssetManager';
import { LightingSystem } from '@systems/LightingSystem';
import { TerrainSystem } from '@terrain/TerrainSystem';

export class WorldManager {
  public readonly terrain: TerrainSystem;
  public readonly districtRegistry: DistrictRegistry;

  private readonly activeStreamingRadius = 900;

  constructor(
    scene: Scene,
    assets: AssetManager,
    lighting: LightingSystem,
    collision: CollisionSystem
  ) {
    this.terrain = new TerrainSystem(scene, assets, collision);
    this.districtRegistry = new DistrictRegistry(scene, assets, lighting, collision);
  }

  public updateStreaming(playerPos: Vector3): void {
    const maxDistSq = this.activeStreamingRadius * this.activeStreamingRadius;
    for (const district of this.districtRegistry.districts) {
      const dx = playerPos.x - district.root.position.x;
      const dz = playerPos.z - district.root.position.z;
      const shouldBeEnabled = dx * dx + dz * dz <= maxDistSq;
      if (district.root.isEnabled() !== shouldBeEnabled) {
        district.root.setEnabled(shouldBeEnabled);
      }
    }
  }

  public getActiveDistrict(playerPos: Vector3): DistrictDefinition {
    return this.districtRegistry.getNearestDistrict(playerPos);
  }
}
