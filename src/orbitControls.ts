import Camera from './Camera';
import { vec3 } from 'gl-matrix';

function initOrbitControls(camera: Camera): void {
  let polarAngle: number;
  let azimuthalAngle: number;
  let mouseDown: boolean;
  let mouseX: number;
  let mouseY: number;

  polarAngle = Math.PI / 2;
  azimuthalAngle = Math.PI / 2;
  mouseDown = false;

  document.addEventListener('mousedown', (event: any) => {
    mouseDown = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
  });
  document.addEventListener('mouseup', () => mouseDown = false);
  document.addEventListener('mousemove', (event: any) => {
    if (!mouseDown) return;

    let dx: number;
    let dy: number;

    dx = event.clientX - mouseX;
    dy = event.clientY - mouseY;

    polarAngle += dx / 100;
    azimuthalAngle -= dy / 100;

    camera.setEye(
      10 * Math.cos(polarAngle) * Math.sin(azimuthalAngle),
      10 * Math.cos(azimuthalAngle),
      10 * Math.sin(polarAngle) * Math.sin(azimuthalAngle)
    );

    mouseX = event.clientX;
    mouseY = event.clientY;
  });
}

export default initOrbitControls;
