import { mat4, vec3, vec4 } from 'gl-matrix';

import Camera from './Camera';
import { CubeFaces } from './Cube';


export default class CubeCamera {
  public readonly cameras: CubeFaces<Camera>;

  constructor(
    private position: vec3,
  ) {
    this.cameras = {
      'x+': new Camera(
          position, vec3.fromValues(1, 0, 0), vec3.fromValues(0, 1, 0)),
      'x-': new Camera(
          position, vec3.fromValues(1, 0, 0), vec3.fromValues(0, 1, 0)),
      'y+': new Camera(
          position, vec3.fromValues(1, 0, 0), vec3.fromValues(0, 1, 0)),
      'y-': new Camera(
          position, vec3.fromValues(1, 0, 0), vec3.fromValues(0, 1, 0)),
      'z+': new Camera(
          position, vec3.fromValues(1, 0, 0), vec3.fromValues(0, 1, 0)),
      'z-': new Camera(
          position, vec3.fromValues(1, 0, 0), vec3.fromValues(0, 1, 0)),
    };
    Object.keys(this.cameras).forEach((key: string) => {
      this.cameras[key].fov = Math.PI / 2;
      this.cameras[key].farPlane = 21;
    });
  }

  public translate(dx: number | vec3, dy?: number, dz?: number): void {
    if (typeof dx === 'number') {
      this.position = vec3.add(
          vec3.create(), vec3.fromValues(dx, dy, dz), this.position);
    } else {
      this.position = vec3.add(vec3.create(), dx, this.position);
    }

    Object.keys(this.cameras).forEach(
        (key: string) => this.cameras[key].setEye(this.position));
  }

  public rotate(rad: number, axis: vec3): void {
    const rotationMatrix = mat4.fromRotation(mat4.create(), rad, axis);
    let normalRotationMatrix = mat4.invert(mat4.create(), rotationMatrix);

    normalRotationMatrix = mat4.transpose(mat4.create(), normalRotationMatrix);
    Object.keys(this.cameras).forEach((key: string) => {
      const at3 = this.cameras[key].at;
      const up3 = this.cameras[key].up;

      let at4 = vec4.fromValues(at3[0], at3[1], at3[2], 1);
      let up4 = vec4.fromValues(up3[0], up3[1], up3[2], 1);

      at4 = vec4.transformMat4(vec4.create(), at4, rotationMatrix);
      up4 = vec4.transformMat4(vec4.create(), up4, normalRotationMatrix);
      this.cameras[key].setAt(at4[0], at4[1], at4[2]);
      this.cameras[key].setUp(up4[0], up4[1], up4[2]);
    });
  }
}
