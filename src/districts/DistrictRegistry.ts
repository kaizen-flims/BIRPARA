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
import { BIRBITY_ORIGIN, latLngToWorld } from '@core/GeoProjection';
import { CollisionSystem } from '@physics/CollisionSystem';
import { AssetManager } from '@systems/AssetManager';
import { LightingSystem } from '@systems/LightingSystem';

export type ReferenceStatus = 'unverified' | 'partial' | 'verified';

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

  constructor(
    scene: Scene,
    assets: AssetManager,
    lighting: LightingSystem,
    collision: CollisionSystem
  ) {
    const specs: Array<{
      id: string;
      name: string;
      lat: number;
      lng: number;
      radius: number;
    }> = [
      { id: 'birbity', name: 'Birbity', lat: BIRBITY_ORIGIN.lat, lng: BIRBITY_ORIGIN.lng, radius: 260 },
      { id: 'college-road', name: 'College Road', lat: 26.7209, lng: 89.1362, radius: 280 },
      { id: 'subhaspally', name: 'Subhaspally', lat: 26.7176, lng: 89.1355, radius: 250 },
      { id: 'birpara-market', name: 'Birpara Market', lat: 26.7116, lng: 89.1404, radius: 320 },
      { id: 'old-bus-stand', name: 'Old Bus Stand', lat: 26.7113, lng: 89.1391, radius: 200 },
      { id: 'hospital-road', name: 'Hospital Road', lat: 26.7155, lng: 89.1438, radius: 300 },
      { id: 'chawpatti', name: 'Chawpatti', lat: 26.7068, lng: 89.1412, radius: 260 },
      { id: 'upar-basty', name: 'Upar Basty', lat: 26.7232, lng: 89.1442, radius: 320 },
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
        referenceStatus: 'unverified',
        root,
      });
    }

    this.buildBirbityCalibrationZone(scene, assets, lighting, collision);
  }

  private buildBirbityCalibrationZone(
    scene: Scene,
    assets: AssetManager,
    lighting: LightingSystem,
    collision: CollisionSystem
  ): void {
    const birbity = this.districts.find((d) => d.id === 'birbity');
    if (!birbity) return;

    const concreteMat = assets.getOrCreatePBRMaterial(
      'calibrationConcreteMat',
      new Color3(0.56, 0.57, 0.55),
      0.88,
      0.0
    );
    const plasterMat = assets.getOrCreatePBRMaterial(
      'calibrationPlasterMat',
      new Color3(0.76, 0.72, 0.65),
      0.9,
      0.0
    );

    const pad = MeshBuilder.CreateBox(
      'birbitySpawnPad',
      { width: 6, height: 0.08, depth: 6 },
      scene
    );
    pad.parent = birbity.root;
    pad.position = new Vector3(0, 0.04, 0);
    pad.material = concreteMat;
    pad.receiveShadows = true;
    collision.registerGroundMesh(pad);

    const wallA = MeshBuilder.CreateBox(
      'calibrationWallNorth',
      { width: 8, height: 3.2, depth: 0.6 },
      scene
    );
    wallA.parent = birbity.root;
    wallA.position = new Vector3(0, 1.6, 10);
    wallA.material = plasterMat;
    wallA.receiveShadows = true;
    lighting.registerShadowCaster(wallA, false);
    collision.registerSolidMesh(wallA);

    const wallB = MeshBuilder.CreateBox(
      'calibrationWallEast',
      { width: 0.6, height: 3.2, depth: 8 },
      scene
    );
    wallB.parent = birbity.root;
    wallB.position = new Vector3(10, 1.6, 2);
    wallB.material = plasterMat;
    wallB.receiveShadows = true;
    lighting.registerShadowCaster(wallB, false);
    collision.registerSolidMesh(wallB);
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
