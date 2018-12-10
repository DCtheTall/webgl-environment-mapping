import Camera from './Camera';


export function initOrbitControls(camera: Camera) {
  let mouseDown = false;
  let mouseX: number;
  let mouseY: number;
  let polarAngle = Math.PI / 2;
  let azimuthalAngle = Math.PI / 2;

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

  document.addEventListener('keydown', (event: any) => {
    if (event.keyCode === 13) {
      polarAngle = Math.PI / 2;
      azimuthalAngle = Math.PI / 2;
      camera.setEye(
        6 * Math.cos(polarAngle) * Math.sin(azimuthalAngle),
        6 * Math.cos(azimuthalAngle),
        6 * Math.sin(polarAngle) * Math.sin(azimuthalAngle)
      );
    }
  });
}
