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

export interface BuildingSpec {
  readonly id: string;
  readonly position: Vector3;
  readonly width: number;
  readonly depth: number;
  readonly floors: 1 | 2 | 3;
  readonly rotationY?: number;
  readonly roofStyle: 'pitched-tin' | 'flat-rcc';
  readonly wallTone: 'cream' | 'ochre' | 'offwhite' | 'terracotta' | 'mint';
  readonly roofTone?: 'silver' | 'red' | 'blue' | 'concrete';
  readonly compoundWall?: boolean;
}

const WALL_COLORS: Record<BuildingSpec['wallTone'], Color3> = {
  cream: new Color3(0.84, 0.8, 0.7),
  ochre: new Color3(0.8, 0.69, 0.49),
  offwhite: new Color3(0.86, 0.86, 0.83),
  terracotta: new Color3(0.72, 0.49, 0.4),
  mint: new Color3(0.72, 0.8, 0.74),
};

const ROOF_COLORS: Record<NonNullable<BuildingSpec['roofTone']>, Color3> = {
  silver: new Color3(0.64, 0.67, 0.7),
  red: new Color3(0.55, 0.25, 0.21),
  blue: new Color3(0.24, 0.36, 0.52),
  concrete: new Color3(0.54, 0.54, 0.52),
};

export class BuildingFactory {
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
  }

  public createBuilding(spec: BuildingSpec, parent: TransformNode): TransformNode {
    const node = new TransformNode(`bldg_${spec.id}`, this.scene);
    node.parent = parent;
    node.position = spec.position.clone();
    node.rotation.y = spec.rotationY ?? 0;

    const floorHeight = 3.05;
    const totalHeight = spec.floors * floorHeight;
    const plinthHeight = 0.4;

    const wallMat = this.assets.getOrCreatePBRMaterial(
      `wallMat_${spec.wallTone}`,
      WALL_COLORS[spec.wallTone],
      0.88,
      0.0
    );
    const plinthMat = this.assets.getOrCreatePBRMaterial(
      'plinthConcreteMat',
      new Color3(0.46, 0.46, 0.44),
      0.92,
      0.0
    );
    const windowMat = this.assets.getOrCreatePBRMaterial(
      'windowDarkGlassMat',
      new Color3(0.14, 0.18, 0.22),
      0.22,
      0.15
    );
    const trimMat = this.assets.getOrCreatePBRMaterial(
      'chajjaTrimMat',
      new Color3(0.78, 0.78, 0.76),
      0.85,
      0.0
    );

    const plinth = MeshBuilder.CreateBox(
      `${spec.id}_plinth`,
      { width: spec.width + 0.3, height: plinthHeight, depth: spec.depth + 0.3 },
      this.scene
    );
    plinth.parent = node;
    plinth.position.y = plinthHeight * 0.5;
    plinth.material = plinthMat;
    plinth.receiveShadows = true;

    const body = MeshBuilder.CreateBox(
      `${spec.id}_body`,
      { width: spec.width, height: totalHeight, depth: spec.depth },
      this.scene
    );
    body.parent = node;
    body.position.y = plinthHeight + totalHeight * 0.5;
    body.material = wallMat;
    body.receiveShadows = true;
    this.lighting.registerShadowCaster(body, false);
    this.collision.registerSolidMesh(body);

    const windowCols = Math.max(2, Math.floor(spec.width / 3.2));
    for (let f = 0; f < spec.floors; f++) {
      const wy = plinthHeight + f * floorHeight + 1.65;
      for (let c = 0; c < windowCols; c++) {
        const wx = -spec.width * 0.5 + ((c + 0.5) / windowCols) * spec.width;
        for (const side of [-1, 1]) {
          const pane = MeshBuilder.CreateBox(
            `${spec.id}_win_${f}_${c}_${side}`,
            { width: 1.15, height: 1.15, depth: 0.08 },
            this.scene
          );
          pane.parent = node;
          pane.position = new Vector3(wx, wy, (spec.depth * 0.5 + 0.02) * side);
          pane.material = windowMat;

          const chajja = MeshBuilder.CreateBox(
            `${spec.id}_chajja_${f}_${c}_${side}`,
            { width: 1.35, height: 0.1, depth: 0.42 },
            this.scene
          );
          chajja.parent = node;
          chajja.position = new Vector3(wx, wy + 0.65, (spec.depth * 0.5 + 0.18) * side);
          chajja.material = trimMat;
        }
      }
    }

    const roofY = plinthHeight + totalHeight;
    if (spec.roofStyle === 'pitched-tin') {
      const tone = spec.roofTone ?? 'silver';
      const roofMat = this.assets.getOrCreatePBRMaterial(
        `tinRoofMat_${tone}`,
        ROOF_COLORS[tone],
        tone === 'silver' ? 0.42 : 0.6,
        tone === 'silver' ? 0.55 : 0.25
      );
      const ridgeHeight = Math.min(2.0, spec.depth * 0.22);
      const slopeLen = Math.hypot(spec.depth * 0.5 + 0.5, ridgeHeight);
      const slopeAngle = Math.atan2(ridgeHeight, spec.depth * 0.5 + 0.5);

      for (const side of [-1, 1]) {
        const panel = MeshBuilder.CreateBox(
          `${spec.id}_tinSlope_${side}`,
          { width: spec.width + 0.8, height: 0.08, depth: slopeLen },
          this.scene
        );
        panel.parent = node;
        panel.position = new Vector3(
          0,
          roofY + ridgeHeight * 0.5,
          (spec.depth * 0.25 + 0.15) * side
        );
        panel.rotation.x = slopeAngle * side;
        panel.material = roofMat;
        this.lighting.registerShadowCaster(panel, false);
      }
    } else {
      const rccMat = this.assets.getOrCreatePBRMaterial(
        'rccRoofMat',
        ROOF_COLORS.concrete,
        0.9,
        0.0
      );
      const slab = MeshBuilder.CreateBox(
        `${spec.id}_slab`,
        { width: spec.width + 0.5, height: 0.18, depth: spec.depth + 0.5 },
        this.scene
      );
      slab.parent = node;
      slab.position.y = roofY + 0.09;
      slab.material = rccMat;
      this.lighting.registerShadowCaster(slab, false);

      const parapetH = 0.85;
      const frontBack = [
        { z: spec.depth * 0.5, w: spec.width + 0.2, d: 0.18 },
        { z: -spec.depth * 0.5, w: spec.width + 0.2, d: 0.18 },
      ];
      frontBack.forEach((p, idx) => {
        const wall = MeshBuilder.CreateBox(
          `${spec.id}_parapetFB_${idx}`,
          { width: p.w, height: parapetH, depth: p.d },
          this.scene
        );
        wall.parent = node;
        wall.position = new Vector3(0, roofY + 0.18 + parapetH * 0.5, p.z);
        wall.material = wallMat;
      });
    }

    if (spec.compoundWall) {
      const boundMat = this.assets.getOrCreatePBRMaterial(
        'compoundBoundaryWallMat',
        new Color3(0.68, 0.65, 0.6),
        0.92,
        0.0
      );
      const padW = spec.width + 4.4;
      const padD = spec.depth + 4.4;
      const wallH = 1.55;

      const backWall = MeshBuilder.CreateBox(
        `${spec.id}_cwall_back`,
        { width: padW, height: wallH, depth: 0.22 },
        this.scene
      );
      backWall.parent = node;
      backWall.position = new Vector3(0, wallH * 0.5, -padD * 0.5);
      backWall.material = boundMat;
      backWall.receiveShadows = true;
      this.collision.registerSolidMesh(backWall);

      for (const side of [-1, 1]) {
        const sideWall = MeshBuilder.CreateBox(
          `${spec.id}_cwall_side_${side}`,
          { width: 0.22, height: wallH, depth: padD },
          this.scene
        );
        sideWall.parent = node;
        sideWall.position = new Vector3(padW * 0.5 * side, wallH * 0.5, 0);
        sideWall.material = boundMat;
        sideWall.receiveShadows = true;
        this.collision.registerSolidMesh(sideWall);
      }
    }

    return node;
  }
}
