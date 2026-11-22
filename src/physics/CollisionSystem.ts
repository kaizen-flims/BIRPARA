import { AbstractMesh, Ray, Scene, Vector3 } from '@babylonjs/core';

export interface BoxCollider {
  readonly id: string;
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
  readonly minZ: number;
  readonly maxZ: number;
}

export class CollisionSystem {
  private readonly scene: Scene;
  private readonly groundMeshes = new Set<AbstractMesh>();
  private readonly solidMeshes = new Set<AbstractMesh>();
  private readonly solidBoxes: BoxCollider[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public registerGroundMesh(mesh: AbstractMesh): void {
    mesh.isPickable = true;
    this.groundMeshes.add(mesh);
  }

  public registerSolidMesh(mesh: AbstractMesh): void {
    mesh.isPickable = true;
    mesh.computeWorldMatrix(true);
    const bounds = mesh.getBoundingInfo().boundingBox;
    this.solidMeshes.add(mesh);
    this.solidBoxes.push({
      id: mesh.name,
      minX: bounds.minimumWorld.x,
      maxX: bounds.maximumWorld.x,
      minY: bounds.minimumWorld.y,
      maxY: bounds.maximumWorld.y,
      minZ: bounds.minimumWorld.z,
      maxZ: bounds.maximumWorld.z,
    });
  }

  public sampleGroundHeight(x: number, z: number, startY = 80): number | null {
    const ray = new Ray(new Vector3(x, startY, z), Vector3.Down(), 200);
    const hit = this.scene.pickWithRay(ray, (mesh) => this.groundMeshes.has(mesh));
    if (hit && hit.hit && hit.pickedPoint) {
      return hit.pickedPoint.y;
    }
    return null;
  }

  public resolveHorizontalCylinder(
    position: Vector3,
    radius: number,
    height: number
  ): Vector3 {
    const resolved = position.clone();
    const footY = resolved.y;
    const headY = resolved.y + height;

    for (let pass = 0; pass < 3; pass++) {
      for (const box of this.solidBoxes) {
        if (headY <= box.minY + 0.05 || footY >= box.maxY - 0.05) {
          continue;
        }
        const closestX = Math.max(box.minX, Math.min(resolved.x, box.maxX));
        const closestZ = Math.max(box.minZ, Math.min(resolved.z, box.maxZ));
        const dx = resolved.x - closestX;
        const dz = resolved.z - closestZ;
        const distSq = dx * dx + dz * dz;

        if (distSq < radius * radius) {
          const dist = Math.sqrt(distSq);
          if (dist > 0.0001) {
            const push = radius - dist;
            resolved.x += (dx / dist) * push;
            resolved.z += (dz / dist) * push;
          } else {
            const penLeft = Math.abs(resolved.x - box.minX);
            const penRight = Math.abs(box.maxX - resolved.x);
            const penBack = Math.abs(resolved.z - box.minZ);
            const penFront = Math.abs(box.maxZ - resolved.z);
            const minPen = Math.min(penLeft, penRight, penBack, penFront);
            if (minPen === penLeft) resolved.x = box.minX - radius;
            else if (minPen === penRight) resolved.x = box.maxX + radius;
            else if (minPen === penBack) resolved.z = box.minZ - radius;
            else resolved.z = box.maxZ + radius;
          }
        }
      }
    }

    return resolved;
  }

  public resolveCameraPosition(
    pivot: Vector3,
    desired: Vector3,
    safetyBuffer = 0.35
  ): Vector3 {
    const delta = desired.subtract(pivot);
    const maxDist = delta.length();
    if (maxDist < 0.01) {
      return desired.clone();
    }

    const dir = delta.scale(1 / maxDist);
    const ray = new Ray(pivot, dir, maxDist);
    const hit = this.scene.pickWithRay(
      ray,
      (mesh) => this.solidMeshes.has(mesh) || this.groundMeshes.has(mesh)
    );

    let safePos = desired.clone();
    if (hit && hit.hit && hit.distance < maxDist) {
      const clampedDist = Math.max(0.8, hit.distance - safetyBuffer);
      safePos = pivot.add(dir.scale(clampedDist));
    }

    const groundY = this.sampleGroundHeight(safePos.x, safePos.z, safePos.y + 10);
    if (groundY !== null && safePos.y < groundY + 0.4) {
      safePos.y = groundY + 0.4;
    }

    return safePos;
  }
}
