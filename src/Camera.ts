import {
  vec3,
  mat4,
} from 'gl-matrix';

export default class Camera {
  private _ASPECT_RATIO: number = 1;
  private _FOVY: number = Math.PI / 3;
  private _NEAR: number = 1e-2;
  private _FAR: number = 1e6;

  private eye: vec3;
  private at: vec3;
  private up: vec3;

  public perspectiveMat: mat4;

  constructor() {
    this.eye = vec3.fromValues(0, 0, 10);
    this.at = vec3.fromValues(0, 0, -100);
    this.up = vec3.fromValues(0, 1, 0);

    this.perspectiveMat = mat4.perspective(mat4.create(), this._ASPECT_RATIO, this._FOVY, this._NEAR, this._FAR);
  }

  public getEye(): vec3 {
    return this.eye;
  }

  public getAt(): vec3 {
    return this.at;
  }

  public getLookAt(): mat4 {
    return mat4.lookAt(mat4.create(), this.eye, this.at, this.up);
  }

  public setEye(x: number, y: number, z: number): void {
    this.eye = vec3.set(this.eye, x, y, z);
  }

  public setAt(x: number, y: number, z: number): void {
    this.at = vec3.set(this.at, x, y, z);
  }

  public setUp(x: number, y: number, z: number): void {
    this.up = vec3.set(this.up, x, y, z);
  }

}
