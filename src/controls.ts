import Camera from './Camera';
import Model from './Model';
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
      6 * Math.cos(polarAngle) * Math.sin(azimuthalAngle),
      6 * Math.cos(azimuthalAngle),
      6 * Math.sin(polarAngle) * Math.sin(azimuthalAngle)
    );

    mouseX = event.clientX;
    mouseY = event.clientY;
  });
}

function initReflectiveModelControls(model: Model): () => void {
  let angularVelocity: number;
  let dTheta: number;

  angularVelocity = 0;
  dTheta = Math.PI / 480;

  document.addEventListener('keydown', (event: any) => {
    switch (event.keyCode) {
      case 37: // left
        angularVelocity -= dTheta;
        return;
      case 39: // right
        angularVelocity += dTheta;
        return;
      case 38: // up
        model.rotate(-Math.PI / 18, vec3.fromValues(1, 0, 0));
        return;
      case 40:
        model.rotate(Math.PI / 18, vec3.fromValues(1, 0, 0));
      default:
        return;
    }
  });

  return () => model.rotate(angularVelocity, vec3.fromValues(0, 1, 0));
}

export {
  initOrbitControls,
  initReflectiveModelControls,
};
