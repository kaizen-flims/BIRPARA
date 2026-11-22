export interface MoveAxes {
  forward: number;
  right: number;
  sprint: boolean;
  cameraHeightDelta: number;
}

export class InputManager {
  private readonly canvas: HTMLCanvasElement;
  private readonly keys = new Set<string>();
  private mouseDeltaX = 0;
  private mouseDeltaY = 0;
  private wheelDelta = 0;
  private isDragging = false;
  private isPointerLocked = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.bindEvents();
  }

  private bindEvents(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
      this.isDragging = false;
    });

    this.canvas.addEventListener('click', () => {
      if (!this.isPointerLocked && this.canvas.requestPointerLock) {
        this.canvas.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.canvas;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0 || e.button === 2) {
        this.isDragging = true;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked || this.isDragging) {
        this.mouseDeltaX += e.movementX;
        this.mouseDeltaY += e.movementY;
      }
    });

    this.canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.wheelDelta += Math.sign(e.deltaY);
      },
      { passive: false }
    );
  }

  public getMoveAxes(): MoveAxes {
    const forward =
      (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0) -
      (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0);
    const right =
      (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0) -
      (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0);
    const sprint = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const cameraHeightDelta =
      (this.keys.has('KeyE') ? 1 : 0) - (this.keys.has('KeyQ') ? 1 : 0);

    return { forward, right, sprint, cameraHeightDelta };
  }

  public consumeMouseDelta(): { dx: number; dy: number } {
    const result = { dx: this.mouseDeltaX, dy: this.mouseDeltaY };
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    return result;
  }

  public consumeWheelDelta(): number {
    const delta = this.wheelDelta;
    this.wheelDelta = 0;
    return delta;
  }

  public get pointerLocked(): boolean {
    return this.isPointerLocked;
  }
}
