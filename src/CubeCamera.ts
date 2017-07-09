import Camera from './Camera';
import CubeFaces from './CubeFaces';
import {
  vec3,
  vec4,
  mat4,
} from 'gl-matrix';

export default class CubeCamera {
  private position: vec3;

  public cameras: CubeFaces<Camera>;

  constructor(position: vec3) {
    this.position = position;
    this.cameras = {
      top: new Camera(position, vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, 1)),
      bottom: new Camera(position, vec3.fromValues(0, -1, 0), vec3.fromValues(0, 0, -1)),
      left: new Camera(position, vec3.fromValues(-1, 0, 0), vec3.fromValues(0, 1, 0)),
      right: new Camera(position, vec3.fromValues(1, 0, 0), vec3.fromValues(0, 1, 0)),
      front: new Camera(position, vec3.fromValues(0, 0, 1), vec3.fromValues(0, 1, 0)),
      back: new Camera(position, vec3.fromValues(0, 0, -1), vec3.fromValues(0, 1, 0)),
    };
  }

  public translate(dx: number|vec3, dy?: number, dz?: number): void {
    if (typeof dx === 'number') {
      this.position = vec3.add(vec3.create(), vec3.fromValues(dx, dy, dz), this.position);
    } else {
      this.position = vec3.add(vec3.create(), dx, this.position);
    }

    Object.keys(this.cameras).forEach((key: string) => {
      this.cameras[key].setEye(this.position);
    });
  }

  public rotate(rad: number, axis: vec3): void {
    let rotationMatrix: mat4;
    let normalRotationMatrix: mat4;

    rotationMatrix = mat4.fromRotation(mat4.create(), rad, axis);
    normalRotationMatrix = mat4.invert(mat4.create(), rotationMatrix);
    normalRotationMatrix = mat4.transpose(mat4.create(), normalRotationMatrix);

    Object.keys(this.cameras).forEach((key: string) => {
      let at3: vec3;
      let at4: vec4;

      let up3: vec3;
      let up4: vec4;

      at3 = this.cameras[key].getAt();
      at4 = vec4.fromValues(at3[0], at3[1], at3[2], 1);
      at4 = vec4.transformMat4(vec4.create(), at4, rotationMatrix);

      up3 = this.cameras[key].getUp();
      up4 = vec4.fromValues(up3[0], up3[1], up3[2], 1);
      up4 = vec4.transformMat4(vec4.create(), up4, normalRotationMatrix);

      this.cameras[key].setAt(at4[0], at4[1], at4[2]);
      this.cameras[key].setUp(up4[0], up4[1], up4[2]);
    });
  }
}
