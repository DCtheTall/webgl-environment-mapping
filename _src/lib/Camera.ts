import {
  vec3,
  mat4,
} from 'gl-matrix';

import {
  DEFAULT_AT,
  DEFAULT_EYE,
  DEFAULT_UP,
  DEFAULT_FOV,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_NEAR_PLANE,
  DEFAULT_FAR_PLANE,
} from './constants';


export default class Camera {
  private _at: vec3;
  private _eye: vec3;
  private _farPlane: number;
  private _fov: number;
  private _up: vec3;

  constructor(
    eye: vec3 = DEFAULT_EYE,
    at: vec3 = DEFAULT_AT,
    up: vec3 = DEFAULT_UP,
  ) {
    this._at = at;
    this._eye = eye;
    this._farPlane = DEFAULT_FAR_PLANE;
    this._fov = DEFAULT_FOV;
    this._up = up;
  }

  public get at(): vec3 {
    return this._at;
  }

  public get eye(): vec3 {
    return this._eye;
  }

  public get fov(): number {
    return this._fov;
  }

  public get lookAtMat(): mat4 {
    return mat4.lookAt(
      mat4.create(), this.eye, this.at, this.up);
  }

  public get perspectiveMat(): mat4 {
    return mat4.perspective(
      mat4.create(),
      this._fov,
      DEFAULT_ASPECT_RATIO,
      DEFAULT_NEAR_PLANE,
      this._farPlane,
    );
  }

  public get up(): vec3 {
    return this._up;
  }

  public setAt(x: vec3 | number, y?: number, z?: number) {
    if (typeof x === 'number') {
      this._at = vec3.fromValues(x, y, z);
    } else {
      this._at = x;
    }
  }

  public setEye(x: vec3 | number, y?: number, z?: number) {
    if (typeof x === 'number') {
      this._eye = vec3.fromValues(x, y, z);
    } else {
      this._eye = x;
    }
  }

  public set farPlane(far: number) {
    this._farPlane = far;
  }

  public set fov(fov: number) {
    this._fov = fov;
  }

  public setUp(x: vec3 | number, y?: number, z?: number) {
    if (typeof x === 'number') {
      this._up = vec3.fromValues(x, y, z);
    } else {
      this._up = x;
    }
  }
}
