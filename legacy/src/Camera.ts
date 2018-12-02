import {
  vec3,
  mat4,
} from 'gl-matrix';

export default class Camera {
  private _ASPECT_RATIO: number = 1;
  private _NEAR: number = 1;

  private FAR: number = 1e6;
  private FOVY: number = Math.PI / 3;

  private eye: vec3;
  private at: vec3;
  private up: vec3;

  constructor(eye?: vec3, at?: vec3, up?: vec3) {
    this.eye = eye || vec3.fromValues(0, 0, 6);
    this.at = at || vec3.fromValues(0, 0, 0);
    this.up = up || vec3.fromValues(0, 1, 0);
  }

  public getEye(): vec3 {
    return this.eye;
  }

  public getAt(): vec3 {
    return this.at;
  }

  public getUp(): vec3 {
    return this.up;
  }

  public getLookAt(): mat4 {
    return mat4.lookAt(mat4.create(), this.eye, this.at, this.up);
  }

  public getPerspective(): mat4 {
    return mat4.perspective(mat4.create(), this.FOVY, this._ASPECT_RATIO, this._NEAR, this.FAR);
  }

  public setEye(x: number|vec3, y?: number, z?: number): void {
    if (typeof x === 'number') this.eye = vec3.set(this.eye, x, y, z);
    else this.eye = x;
  }

  public setAt(x: number, y: number, z: number): void {
    this.at = vec3.set(this.at, x, y, z);
  }

  public setUp(x: number, y: number, z: number): void {
    this.up = vec3.set(this.up, x, y, z);
  }

  public setFOVY(fovy: number) {
    this.FOVY = fovy;
  }

  public setFar(far: number) {
    this.FAR = far;
  }
}
