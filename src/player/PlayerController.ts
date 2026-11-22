import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import { InputManager } from '@controls/InputManager';
import { CollisionSystem } from '@physics/CollisionSystem';
import { AssetManager } from '@systems/AssetManager';
import { LightingSystem } from '@systems/LightingSystem';

export interface PlayerState {
  readonly position: Vector3;
  readonly isRunning: boolean;
  readonly isGrounded: boolean;
  readonly speed: number;
}

export class PlayerController {
  public readonly root: TransformNode;
  public readonly height = 1.75;
  public readonly radius = 0.35;

  private readonly bodyMesh: Mesh;
  private readonly collision: CollisionSystem;
  private readonly walkSpeed = 1.65;
  private readonly runSpeed = 4.8;
  private readonly gravity = -9.81;
  private readonly turnLerpRate = 12.0;

  private velocityY = 0;
  private yaw = 0;
  private isGrounded = false;
  private isRunning = false;
  private currentSpeed = 0;

  constructor(
    scene: Scene,
    assets: AssetManager,
    lighting: LightingSystem,
    collision: CollisionSystem,
    spawnPosition: Vector3
  ) {
    this.collision = collision;
    this.root = new TransformNode('playerRoot', scene);
    this.root.position = spawnPosition.clone();

    this.bodyMesh = MeshBuilder.CreateCylinder(
      'playerCylinder',
      { height: this.height, diameter: this.radius * 2, tessellation: 24 },
      scene
    );
    this.bodyMesh.parent = this.root;
    this.bodyMesh.position.y = this.height * 0.5;
    this.bodyMesh.material = assets.getOrCreatePBRMaterial(
      'playerCylinderMat',
      new Color3(0.88, 0.38, 0.12),
      0.65,
      0.05
    );
    this.bodyMesh.isPickable = false;

    const visor = MeshBuilder.CreateBox(
      'playerFacingIndicator',
      { width: 0.36, height: 0.1, depth: 0.14 },
      scene
    );
    visor.parent = this.root;
    visor.position = new Vector3(0, this.height * 0.78, this.radius * 0.85);
    visor.material = assets.getOrCreatePBRMaterial(
      'playerVisorMat',
      new Color3(0.12, 0.14, 0.18),
      0.35,
      0.1
    );
    visor.isPickable = false;

    lighting.registerShadowCaster(this.bodyMesh, true);
    lighting.registerShadowCaster(visor, false);

    const startGround = this.collision.sampleGroundHeight(spawnPosition.x, spawnPosition.z);
    if (startGround !== null) {
      this.root.position.y = startGround;
      this.isGrounded = true;
    }
  }

  public update(dt: number, input: InputManager, cameraYaw: number): void {
    const axes = input.getMoveAxes();
    const hasMove = axes.forward !== 0 || axes.right !== 0;
    this.isRunning = hasMove && axes.sprint;

    let moveX = 0;
    let moveZ = 0;

    if (hasMove) {
      const forwardX = Math.sin(cameraYaw);
      const forwardZ = Math.cos(cameraYaw);
      const rightX = Math.cos(cameraYaw);
      const rightZ = -Math.sin(cameraYaw);

      moveX = forwardX * axes.forward + rightX * axes.right;
      moveZ = forwardZ * axes.forward + rightZ * axes.right;
      const len = Math.hypot(moveX, moveZ);
      if (len > 0.0001) {
        moveX /= len;
        moveZ /= len;
      }

      const targetSpeed = this.isRunning ? this.runSpeed : this.walkSpeed;
      this.currentSpeed = targetSpeed;

      const targetYaw = Math.atan2(moveX, moveZ);
      let deltaYaw = targetYaw - this.yaw;
      while (deltaYaw > Math.PI) deltaYaw -= Math.PI * 2;
      while (deltaYaw < -Math.PI) deltaYaw += Math.PI * 2;
      this.yaw += deltaYaw * Math.min(1, this.turnLerpRate * dt);
      this.root.rotation.y = this.yaw;

      const nextPos = this.root.position.clone();
      nextPos.x += moveX * targetSpeed * dt;
      nextPos.z += moveZ * targetSpeed * dt;

      const resolved = this.collision.resolveHorizontalCylinder(
        nextPos,
        this.radius,
        this.height
      );
      this.root.position.x = resolved.x;
      this.root.position.z = resolved.z;
    } else {
      this.currentSpeed = 0;
    }

    const groundY = this.collision.sampleGroundHeight(
      this.root.position.x,
      this.root.position.z,
      this.root.position.y + 1.5
    );

    this.velocityY += this.gravity * dt;
    this.root.position.y += this.velocityY * dt;

    if (groundY !== null && this.root.position.y <= groundY + 0.08) {
      this.root.position.y = groundY;
      this.velocityY = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
  }

  public getState(): PlayerState {
    return {
      position: this.root.position.clone(),
      isRunning: this.isRunning,
      isGrounded: this.isGrounded,
      speed: this.currentSpeed,
    };
  }
}
