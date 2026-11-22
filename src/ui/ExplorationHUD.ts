import { CameraSettings } from '@camera/ThirdPersonCamera';
import { worldToLatLng } from '@core/GeoProjection';
import { DistrictDefinition } from '@districts/DistrictRegistry';
import { PlayerState } from '@player/PlayerController';

export class ExplorationHUD {
  private readonly container: HTMLDivElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.style.cssText = [
      'position:fixed',
      'top:14px',
      'left:14px',
      'padding:10px 14px',
      'background:rgba(16,21,24,0.72)',
      'backdrop-filter:blur(6px)',
      'color:#eef2f4',
      'font-size:12px',
      'line-height:1.5',
      'border-radius:8px',
      'border:1px solid rgba(255,255,255,0.12)',
      'pointer-events:none',
      'user-select:none',
      'z-index:10',
    ].join(';');
    document.body.appendChild(this.container);
  }

  public update(
    player: PlayerState,
    camera: CameraSettings,
    district: DistrictDefinition,
    pointerLocked: boolean
  ): void {
    const gps = worldToLatLng(player.position.x, player.position.z);
    const mode = player.isRunning ? 'Run' : player.speed > 0.05 ? 'Walk' : 'Idle';
    const mouseHint = pointerLocked
      ? 'Mouse: Orbit (ESC to unlock)'
      : 'Click canvas or drag: Orbit camera';

    this.container.innerHTML = `
      <div style="font-weight:600;letter-spacing:0.04em;margin-bottom:4px;">BIRPARA · ${district.name}</div>
      <div>GPS: ${gps.lat.toFixed(6)}°N, ${gps.lng.toFixed(6)}°E</div>
      <div>State: ${mode} · Cam: ${camera.distance.toFixed(1)}m / H ${camera.heightOffset.toFixed(2)}m</div>
      <div style="opacity:0.75;margin-top:4px;">WASD/Arrows: Move · Shift: Run · Scroll: Zoom · Q/E: Cam Height</div>
      <div style="opacity:0.75;">${mouseHint}</div>
    `;
  }
}
