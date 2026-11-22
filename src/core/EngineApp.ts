import { Engine, Scene } from '@babylonjs/core';

export type UpdateCallback = (dtSeconds: number) => void;

export class EngineApp {
  public readonly canvas: HTMLCanvasElement;
  public readonly engine: Engine;
  public readonly scene: Scene;

  private readonly updaters: UpdateCallback[] = [];
  private readonly onResizeBound: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: false,
      stencil: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    this.scene = new Scene(this.engine);
    this.scene.collisionsEnabled = false;

    this.onResizeBound = () => this.engine.resize();
    window.addEventListener('resize', this.onResizeBound);
  }

  public addUpdater(callback: UpdateCallback): void {
    this.updaters.push(callback);
  }

  public start(): void {
    this.engine.runRenderLoop(() => {
      const dtSeconds = Math.min(this.engine.getDeltaTime() / 1000, 0.05);
      for (const updater of this.updaters) {
        updater(dtSeconds);
      }
      this.scene.render();
    });
  }

  public dispose(): void {
    window.removeEventListener('resize', this.onResizeBound);
    this.scene.dispose();
    this.engine.dispose();
  }
}
