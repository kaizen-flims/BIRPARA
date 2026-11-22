import { FreeCamera, Scene, Vector3 } from '@babylonjs/core';
import { InputManager } from '@controls/InputManager';
import { CollisionSystem } from '@physics/CollisionSystem';

export interface CameraSettings {
  readonly distance: number;
  readonly heightOffset: number;
}

export class ThirdPersonCamera {
  public readonly camera: FreeCamera;

  private readonly collision: CollisionSystem;
  private yaw = 0;
  private pitch = 0.28;
  private distance = 5.5;
  private heightOffset = 1.65;

  private readonly minDistance = 2.8;
  private readonly maxDistance = 12.0;
  private readonly minHeight = 1.1;
  private readonly maxHeight = 3.2;
  private readonly minPitch = -0.22;
  private readonly maxPitch = 1.08;
  private readonly sensitivity = 0.0024;
  private readonly followLerp = 14.0;

  private smoothedPivot: Vector3;

  constructor(scene: Scene, collision: CollisionSystem, initialTarget: Vector3) {
    this.collision = collision;
    this.smoothedPivot = initialTarget.add(new Vector3(0, this.heightOffset, 0));

    this.camera = new FreeCamera('thirdPersonCamera', this.smoothedPivot.clone(), scene);
    this.camera.minZ = 0.2;
    this.camera.maxZ = 2500;
    this.camera.fov = 0.85;
    scene.activeCamera = this.camera;
  }

  public update(dt: number, targetPosition: Vector3, input: InputManager): void {
    const { dx, dy } = input.consumeMouseDelta();
    this.yaw += dx * this.sensitivity;
    this.pitch = Math.max(
      this.minPitch,
      Math.min(this.maxPitch, this.pitch + dy * this.sensitivity)
    );

    const wheel = input.consumeWheelDelta();
    if (wheel !== 0) {
      this.distance = Math.max(
        this.minDistance,
        Math.min(this.maxDistance, this.distance + wheel * 0.5)
      );
    }

    const axes = input.getMoveAxes();
    if (axes.cameraHeightDelta !== 0) {
      this.heightOffset = Math.max(
        this.minHeight,
        Math.min(this.maxHeight, this.heightOffset + axes.cameraHeightDelta * 1.4 * dt)
      );
    }

    const desiredPivot = targetPosition.add(new Vector3(0, this.heightOffset, 0));
    const lerpAlpha = Math.min(1, this.followLerp * dt);
    this.smoothedPivot = Vector3.Lerp(this.smoothedPivot, desiredPivot, lerpAlpha);

    const horizDist = this.distance * Math.cos(this.pitch);
    const offsetX = -Math.sin(this.yaw) * horizDist;
    const offsetZ = -Math.cos(this.yaw) * horizDist;
    const offsetY = Math.sin(this.pitch) * this.distance;

    const desiredCamPos = this.smoothedPivot.add(new Vector3(offsetX, offsetY, offsetZ));
    const safeCamPos = this.collision.resolveCameraPosition(
      this.smoothedPivot,
      desiredCamPos
    );

    this.camera.position.copyFrom(safeCamPos);
    this.camera.setTarget(this.smoothedPivot);
  }

  public getYaw(): number {
    return this.yaw;
  }

  public getSettings(): CameraSettings {
    return {
      distance: this.distance,
      heightOffset: this.heightOffset,
    };
  }
}
