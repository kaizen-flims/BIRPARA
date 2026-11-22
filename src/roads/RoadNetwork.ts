import {
  Color3,
  MeshBuilder,
  Scene,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import { CollisionSystem } from '@physics/CollisionSystem';
import { AssetManager } from '@systems/AssetManager';
import { LightingSystem } from '@systems/LightingSystem';

export interface RoadSegmentSpec {
  readonly id: string;
  readonly start: Vector3;
  readonly end: Vector3;
  readonly width: number;
  readonly surface: 'asphalt' | 'concrete' | 'unpaved';
  readonly hasDrains?: boolean;
  readonly hasPoles?: boolean;
}

export class RoadNetwork {
  public readonly root: TransformNode;
  private readonly scene: Scene;
  private readonly assets: AssetManager;
  private readonly lighting: LightingSystem;
  private readonly collision: CollisionSystem;

  constructor(
    scene: Scene,
    assets: AssetManager,
    lighting: LightingSystem,
    collision: CollisionSystem
  ) {
    this.scene = scene;
    this.assets = assets;
    this.lighting = lighting;
    this.collision = collision;
    this.root = new TransformNode('roadNetworkRoot', scene);
  }

  public buildSegment(spec: RoadSegmentSpec): void {
    const delta = spec.end.subtract(spec.start);
    const length = Math.hypot(delta.x, delta.z);
    if (length < 0.5) return;

    const mid = spec.start.add(spec.end).scale(0.5);
    const angleY = Math.atan2(delta.x, delta.z);

    const surfaceMat = this.getSurfaceMaterial(spec.surface);
    const roadMesh = MeshBuilder.CreateBox(
      `road_${spec.id}`,
      { width: spec.width, height: 0.08, depth: length + spec.width * 0.35 },
      this.scene
    );
    roadMesh.parent = this.root;
    roadMesh.position = new Vector3(mid.x, 0.04, mid.z);
    roadMesh.rotation.y = angleY;
    roadMesh.material = surfaceMat;
    roadMesh.receiveShadows = true;
    this.collision.registerGroundMesh(roadMesh);

    const shoulderMat = this.assets.getOrCreatePBRMaterial(
      'roadShoulderEarthMat',
      new Color3(0.45, 0.39, 0.31),
      0.95,
      0.0
    );
    const shoulderWidth = spec.surface === 'unpaved' ? 0.5 : 1.1;
    const shoulder = MeshBuilder.CreateBox(
      `shoulder_${spec.id}`,
      { width: spec.width + shoulderWidth * 2, height: 0.04, depth: length + spec.width * 0.3 },
      this.scene
    );
    shoulder.parent = this.root;
    shoulder.position = new Vector3(mid.x, 0.02, mid.z);
    shoulder.rotation.y = angleY;
    shoulder.material = shoulderMat;
    shoulder.receiveShadows = true;
    this.collision.registerGroundMesh(shoulder);

    if (spec.hasDrains) {
      const drainMat = this.assets.getOrCreatePBRMaterial(
        'concreteDrainMat',
        new Color3(0.52, 0.53, 0.5),
        0.9,
        0.0
      );
      const rightX = Math.cos(angleY);
      const rightZ = -Math.sin(angleY);
      const offset = spec.width * 0.5 + 0.45;

      for (const side of [-1, 1]) {
        const curb = MeshBuilder.CreateBox(
          `drain_${spec.id}_${side > 0 ? 'R' : 'L'}`,
          { width: 0.32, height: 0.14, depth: length },
          this.scene
        );
        curb.parent = this.root;
        curb.position = new Vector3(
          mid.x + rightX * offset * side,
          0.07,
          mid.z + rightZ * offset * side
        );
        curb.rotation.y = angleY;
        curb.material = drainMat;
        curb.receiveShadows = true;
      }
    }

    if (spec.hasPoles && length >= 20) {
      const poleMat = this.assets.getOrCreatePBRMaterial(
        'utilityPoleConcreteMat',
        new Color3(0.61, 0.62, 0.6),
        0.88,
        0.05
      );
      const dirX = delta.x / length;
      const dirZ = delta.z / length;
      const rightX = Math.cos(angleY);
      const rightZ = -Math.sin(angleY);
      const lateral = spec.width * 0.5 + 1.05;
      const spacing = 28;
      const count = Math.floor(length / spacing);

      for (let i = 1; i <= count; i++) {
        const dist = i * spacing - spacing * 0.4;
        const px = spec.start.x + dirX * dist + rightX * lateral;
        const pz = spec.start.z + dirZ * dist + rightZ * lateral;

        const pole = MeshBuilder.CreateBox(
          `pole_${spec.id}_${i}`,
          { width: 0.22, height: 7.4, depth: 0.22 },
          this.scene
        );
        pole.parent = this.root;
        pole.position = new Vector3(px, 3.7, pz);
        pole.material = poleMat;
        pole.receiveShadows = true;
        this.lighting.registerShadowCaster(pole, false);
        this.collision.registerSolidMesh(pole);

        const crossArm = MeshBuilder.CreateBox(
          `poleArm_${spec.id}_${i}`,
          { width: 1.4, height: 0.1, depth: 0.1 },
          this.scene
        );
        crossArm.parent = this.root;
        crossArm.position = new Vector3(px, 6.9, pz);
        crossArm.rotation.y = angleY;
        crossArm.material = poleMat;
      }
    }
  }

  public buildRailwayCorridor(start: Vector3, end: Vector3): void {
    const delta = end.subtract(start);
    const length = Math.hypot(delta.x, delta.z);
    if (length < 1) return;

    const mid = start.add(end).scale(0.5);
    const angleY = Math.atan2(delta.x, delta.z);

    const ballastMat = this.assets.getOrCreatePBRMaterial(
      'railBallastMat',
      new Color3(0.42, 0.4, 0.37),
      0.95,
      0.0
    );
    const bed = MeshBuilder.CreateBox(
      'railBallastBed',
      { width: 5.2, height: 0.36, depth: length },
      this.scene
    );
    bed.parent = this.root;
    bed.position = new Vector3(mid.x, 0.18, mid.z);
    bed.rotation.y = angleY;
    bed.material = ballastMat;
    bed.receiveShadows = true;
    this.collision.registerGroundMesh(bed);

    const steelMat = this.assets.getOrCreatePBRMaterial(
      'railSteelMat',
      new Color3(0.32, 0.29, 0.27),
      0.45,
      0.75
    );
    const rightX = Math.cos(angleY);
    const rightZ = -Math.sin(angleY);

    for (const side of [-1, 1]) {
      const rail = MeshBuilder.CreateBox(
        `railSteel_${side > 0 ? 'R' : 'L'}`,
        { width: 0.1, height: 0.16, depth: length },
        this.scene
      );
      rail.parent = this.root;
      rail.position = new Vector3(
        mid.x + rightX * 0.84 * side,
        0.42,
        mid.z + rightZ * 0.84 * side
      );
      rail.rotation.y = angleY;
      rail.material = steelMat;
    }
  }

  private getSurfaceMaterial(surface: 'asphalt' | 'concrete' | 'unpaved') {
    if (surface === 'asphalt') {
      return this.assets.getOrCreatePBRMaterial(
        'roadAsphaltMat',
        new Color3(0.24, 0.25, 0.26),
        0.9,
        0.02
      );
    }
    if (surface === 'concrete') {
      return this.assets.getOrCreatePBRMaterial(
        'roadConcreteMat',
        new Color3(0.55, 0.54, 0.51),
        0.88,
        0.0
      );
    }
    return this.assets.getOrCreatePBRMaterial(
      'roadUnpavedMat',
      new Color3(0.51, 0.43, 0.33),
      0.96,
      0.0
    );
  }
}
