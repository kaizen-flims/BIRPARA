import {
  AssetContainer,
  Color3,
  PBRMaterial,
  Scene,
  SceneLoader,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

export class AssetManager {
  private readonly scene: Scene;
  private readonly containerCache = new Map<string, Promise<AssetContainer>>();
  private readonly materialCache = new Map<string, PBRMaterial>();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public loadModelContainer(rootUrl: string, filename: string): Promise<AssetContainer> {
    const key = `${rootUrl}${filename}`;
    const cached = this.containerCache.get(key);
    if (cached) {
      return cached;
    }
    const loadPromise = SceneLoader.LoadAssetContainerAsync(rootUrl, filename, this.scene);
    this.containerCache.set(key, loadPromise);
    return loadPromise;
  }

  public getOrCreatePBRMaterial(
    id: string,
    albedo: Color3,
    roughness = 0.85,
    metallic = 0.0
  ): PBRMaterial {
    const existing = this.materialCache.get(id);
    if (existing) {
      return existing;
    }
    const mat = new PBRMaterial(id, this.scene);
    mat.albedoColor = albedo;
    mat.roughness = roughness;
    mat.metallic = metallic;
    this.materialCache.set(id, mat);
    return mat;
  }
}
