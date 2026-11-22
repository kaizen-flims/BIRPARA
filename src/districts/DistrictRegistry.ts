import { Scene, TransformNode, Vector3 } from '@babylonjs/core';
import { BuildingFactory } from '@buildings/BuildingFactory';
import { BIRBITY_ORIGIN, latLngToWorld } from '@core/GeoProjection';
import { buildBirbityDistrict } from '@districts/BirbityDistrict';
import { CollisionSystem } from '@physics/CollisionSystem';
import { RoadNetwork } from '@roads/RoadNetwork';
import { AssetManager } from '@systems/AssetManager';
import { LightingSystem } from '@systems/LightingSystem';
import { VegetationSystem } from '@vegetation/VegetationSystem';

export type ReferenceStatus = 'unverified' | 'osm-baseline' | 'verified';

export interface DistrictDefinition {
  readonly id: string;
  readonly name: string;
  readonly anchorLat: number;
  readonly anchorLng: number;
  readonly radiusMeters: number;
  readonly referenceStatus: ReferenceStatus;
  readonly root: TransformNode;
}

export class DistrictRegistry {
  public readonly districts: DistrictDefinition[] = [];
  public readonly roads: RoadNetwork;
  public readonly buildings: BuildingFactory;
  public readonly vegetation: VegetationSystem;

  constructor(
    scene: Scene,
    assets: AssetManager,
    lighting: LightingSystem,
    collision: CollisionSystem
  ) {
    this.roads = new RoadNetwork(scene, assets, lighting, collision);
    this.buildings = new BuildingFactory(scene, assets, lighting, collision);
    this.vegetation = new VegetationSystem(scene, assets, lighting, collision);

    const specs: Array<{
      id: string;
      name: string;
      lat: number;
      lng: number;
      radius: number;
      status: ReferenceStatus;
    }> = [
      { id: 'birbity', name: 'Birbity', lat: BIRBITY_ORIGIN.lat, lng: BIRBITY_ORIGIN.lng, radius: 260, status: 'osm-baseline' },
      { id: 'college-road', name: 'College Road', lat: 26.7209, lng: 89.1362, radius: 280, status: 'unverified' },
      { id: 'subhaspally', name: 'Subhaspally', lat: 26.7176, lng: 89.1355, radius: 250, status: 'unverified' },
      { id: 'birpara-market', name: 'Birpara Market', lat: 26.7116, lng: 89.1404, radius: 320, status: 'unverified' },
      { id: 'old-bus-stand', name: 'Old Bus Stand', lat: 26.7113, lng: 89.1391, radius: 200, status: 'unverified' },
      { id: 'hospital-road', name: 'Hospital Road', lat: 26.7155, lng: 89.1438, radius: 300, status: 'unverified' },
      { id: 'chawpatti', name: 'Chawpatti', lat: 26.7068, lng: 89.1412, radius: 260, status: 'unverified' },
      { id: 'upar-basty', name: 'Upar Basty', lat: 26.7232, lng: 89.1442, radius: 320, status: 'unverified' },
    ];

    for (const spec of specs) {
      const root = new TransformNode(`district_${spec.id}`, scene);
      root.position = latLngToWorld(spec.lat, spec.lng, 0);
      this.districts.push({
        id: spec.id,
        name: spec.name,
        anchorLat: spec.lat,
        anchorLng: spec.lng,
        radiusMeters: spec.radius,
        referenceStatus: spec.status,
        root,
      });
    }

    const birbity = this.districts.find((d) => d.id === 'birbity');
    if (birbity) {
      buildBirbityDistrict(birbity.root, this.roads, this.buildings, this.vegetation);
    }
  }

  public getNearestDistrict(worldPos: Vector3): DistrictDefinition {
    let nearest = this.districts[0];
    let bestDistSq = Number.POSITIVE_INFINITY;

    for (const district of this.districts) {
      const dx = worldPos.x - district.root.position.x;
      const dz = worldPos.z - district.root.position.z;
      const distSq = dx * dx + dz * dz;
      if (distSq < bestDistSq) {
        bestDistSq = distSq;
        nearest = district;
      }
    }
    return nearest;
  }
}
