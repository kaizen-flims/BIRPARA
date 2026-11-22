import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import { CollisionSystem } from '@physics/CollisionSystem';
import { AssetManager } from '@systems/AssetManager';
import { LightingSystem } from '@systems/LightingSystem';

export class VegetationSystem {
  public readonly root: TransformNode;

  private readonly scene: Scene;
  private readonly lighting: LightingSystem;
  private readonly collision: CollisionSystem;
  private readonly treeTrunkProto: Mesh;
  private readonly treeCrownProto: Mesh;
  private readonly teaBushProto: Mesh;
  private treeCounter = 0;
  private teaCounter = 0;

  constructor(
    scene: Scene,
    assets: AssetManager,
    lighting: LightingSystem,
    collision: CollisionSystem
  ) {
    this.scene = scene;
    this.lighting = lighting;
    this.collision = collision;
    this.root = new TransformNode('vegetationRoot', scene);

    const trunkMat = assets.getOrCreatePBRMaterial(
      'dooarsBarkMat',
      new Color3(0.32, 0.24, 0.17),
      0.95,
      0.0
    );
    const canopyMat = assets.getOrCreatePBRMaterial(
      'dooarsCanopyMat',
      new Color3(0.18, 0.34, 0.16),
      0.88,
      0.0
    );
    const teaMat = assets.getOrCreatePBRMaterial(
      'dooarsTeaLeafMat',
      new Color3(0.24, 0.45, 0.19),
      0.84,
      0.0
    );

    this.treeTrunkProto = MeshBuilder.CreateCylinder(
      'treeTrunkProto',
      { height: 4.5, diameterTop: 0.32, diameterBottom: 0.52, tessellation: 8 },
      scene
    );
    this.treeTrunkProto.material = trunkMat;
    this.treeTrunkProto.isVisible = false;

    this.treeCrownProto = MeshBuilder.CreateIcoSphere(
      'treeCrownProto',
      { radius: 2.8, subdivisions: 2 },
      scene
    );
    this.treeCrownProto.material = canopyMat;
    this.treeCrownProto.isVisible = false;

    this.teaBushProto = MeshBuilder.CreateBox(
      'teaBushRowProto',
      { width: 1.4, height: 0.95, depth: 24 },
      scene
    );
    this.teaBushProto.material = teaMat;
    this.teaBushProto.isVisible = false;
  }

  public placeShadeTree(position: Vector3, scale = 1.0): void {
    const idx = this.treeCounter++;
    const trunk = this.treeTrunkProto.createInstance(`treeTrunk_${idx}`);
    trunk.parent = this.root;
    trunk.position = new Vector3(position.x, 2.25 * scale, position.z);
    trunk.scaling = new Vector3(scale, scale, scale);
    trunk.receiveShadows = true;
    this.lighting.registerShadowCaster(trunk, false);
    this.collision.registerSolidMesh(trunk);

    const crown = this.treeCrownProto.createInstance(`treeCrown_${idx}`);
    crown.parent = this.root;
    crown.position = new Vector3(position.x, 5.4 * scale, position.z);
    crown.scaling = new Vector3(scale * 1.15, scale * 0.85, scale * 1.15);
    this.lighting.registerShadowCaster(crown, false);
  }

  public placeTeaGardenPatch(
    origin: Vector3,
    rows: number,
    rowSpacing = 2.4,
    rotationY = 0
  ): void {
    const cos = Math.cos(rotationY);
    const sin = Math.sin(rotationY);

    for (let i = 0; i < rows; i++) {
      const localX = (i - rows * 0.5) * rowSpacing;
      const wx = origin.x + localX * cos;
      const wz = origin.z - localX * sin;

      const bush = this.teaBushProto.createInstance(`teaRow_${this.teaCounter++}`);
      bush.parent = this.root;
      bush.position = new Vector3(wx, 0.48, wz);
      bush.rotation.y = rotationY;
      bush.receiveShadows = true;

      if (i % 5 === 2) {
        this.placeShadeTree(new Vector3(wx, 0, wz + (i % 2 === 0 ? -5 : 5)), 1.25);
      }
    }
  }

  public placeStreamChannel(points: Vector3[], width: number): void {
    const waterMat = this.assetsOrSceneWaterMat();
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const delta = b.subtract(a);
      const len = Math.hypot(delta.x, delta.z);
      if (len < 1) continue;
      const mid = a.add(b).scale(0.5);
      const strip = MeshBuilder.CreateBox(
        `streamSeg_${i}`,
        { width, height: 0.05, depth: len + width * 0.3 },
        this.scene
      );
      strip.parent = this.root;
      strip.position = new Vector3(mid.x, 0.025, mid.z);
      strip.rotation.y = Math.atan2(delta.x, delta.z);
      strip.material = waterMat;
      strip.receiveShadows = true;
    }
  }

  private assetsOrSceneWaterMat() {
    const existing = this.scene.getMaterialByName('dooarsStreamWaterMat');
    if (existing) return existing;
    const mat = this.treeCrownProto.material!.clone('dooarsStreamWaterMat');
    if (mat && 'albedoColor' in mat) {
      (mat as { albedoColor: Color3; roughness: number }).albedoColor = new Color3(0.18, 0.34, 0.42);
      (mat as { albedoColor: Color3; roughness: number }).roughness = 0.18;
    }
    return mat;
  }
}
