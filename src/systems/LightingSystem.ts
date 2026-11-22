import {
  AbstractMesh,
  Color3,
  Color4,
  DirectionalLight,
  HemisphericLight,
  Scene,
  ShadowGenerator,
  Vector3,
} from '@babylonjs/core';

export class LightingSystem {
  public readonly sunLight: DirectionalLight;
  public readonly skyFill: HemisphericLight;
  public readonly shadowGenerator: ShadowGenerator;

  constructor(scene: Scene) {
    scene.clearColor = new Color4(0.68, 0.81, 0.93, 1.0);
    scene.fogMode = Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.0012;
    scene.fogColor = new Color3(0.75, 0.84, 0.91);

    this.skyFill = new HemisphericLight('dooarsSkyFill', new Vector3(0.1, 1.0, 0.15), scene);
    this.skyFill.intensity = 0.65;
    this.skyFill.diffuse = new Color3(0.92, 0.95, 1.0);
    this.skyFill.groundColor = new Color3(0.32, 0.34, 0.28);

    const sunDir = new Vector3(-0.45, -0.82, -0.35).normalize();
    this.sunLight = new DirectionalLight('dooarsSun', sunDir, scene);
    this.sunLight.position = sunDir.scale(-120);
    this.sunLight.intensity = 2.1;
    this.sunLight.diffuse = new Color3(1.0, 0.96, 0.88);
    this.sunLight.shadowMinZ = 10;
    this.sunLight.shadowMaxZ = 300;

    this.shadowGenerator = new ShadowGenerator(2048, this.sunLight);
    this.shadowGenerator.usePercentageCloserFiltering = true;
    this.shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
    this.shadowGenerator.bias = 0.0006;
  }

  public registerShadowCaster(mesh: AbstractMesh, includeDescendants = true): void {
    this.shadowGenerator.addShadowCaster(mesh, includeDescendants);
  }
}
