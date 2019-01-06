import { vec3 } from 'gl-matrix';

import Camera from './Camera';
import { CubeFaces } from './Cube';


const CUBE_CAMERA_TEXTURE_WIDTH = 128;


export default class CubeCamera {
  private _texture: WebGLTexture;
  private cameras: CubeFaces<Camera>;
  private frameBuffers: CubeFaces<WebGLFramebuffer>;
  private glCubeFaces: CubeFaces<number>;
  private renderBuffers: CubeFaces<WebGLRenderbuffer>;

  constructor(
    private gl: WebGLRenderingContext,
    private position: vec3,
  ) {
    this._texture = gl.createTexture();
    this.cameras = {
      'x+': new Camera(
          position, vec3.fromValues(1, 0, 0), vec3.fromValues(0, -1, 0)),
      'x-': new Camera(
          position, vec3.fromValues(-1, 0, 0), vec3.fromValues(0, -1, 0)),
      'y+': new Camera(
          position, vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, 1)),
      'y-': new Camera(
          position, vec3.fromValues(0, -1, 0), vec3.fromValues(0, 0, 1)),
      'z+': new Camera(
          position, vec3.fromValues(0, 0, 1), vec3.fromValues(0, -1, 0)),
      'z-': new Camera(
          position, vec3.fromValues(0, 0, -1), vec3.fromValues(0, -1, 0)),
    };
    this.frameBuffers = {
      'x+': gl.createFramebuffer(),
      'x-': gl.createFramebuffer(),
      'y+': gl.createFramebuffer(),
      'y-': gl.createFramebuffer(),
      'z+': gl.createFramebuffer(),
      'z-': gl.createFramebuffer(),
    };
    this.glCubeFaces = {
      'x+': gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      'x-': gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      'y+': gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      'y-': gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      'z+': gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      'z-': gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    };
    this.renderBuffers = {
      'x+': gl.createRenderbuffer(),
      'x-': gl.createRenderbuffer(),
      'y+': gl.createRenderbuffer(),
      'y-': gl.createRenderbuffer(),
      'z+': gl.createRenderbuffer(),
      'z-': gl.createRenderbuffer(),
    };

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    for (const key of Object.keys(this.cameras)) {
      const face = this.glCubeFaces[key];
      const cam = this.cameras[key];
      cam.fov = Math.PI / 2;
      cam.farPlane = 30;
      gl.texImage2D(
        face,
        0,
        gl.RGBA,
        CUBE_CAMERA_TEXTURE_WIDTH,
        CUBE_CAMERA_TEXTURE_WIDTH,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
      );
    }
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  }

  public get texture(): WebGLTexture {
    return this._texture;
  }

  public renderTexture(
    callback: (
      fBuffer: WebGLFramebuffer,
      rBuffer: WebGLRenderbuffer,
      camera: Camera,
      width: number,
      height: number,
    ) => void,
  ) {
    for (const key of Object.keys(this.cameras)) {
      const fBuffer = this.frameBuffers[key];
      const rBuffer = this.renderBuffers[key];

      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fBuffer);
      this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, rBuffer);
      this.gl.renderbufferStorage(this.gl.RENDERBUFFER,
          this.gl.DEPTH_COMPONENT16, CUBE_CAMERA_TEXTURE_WIDTH, CUBE_CAMERA_TEXTURE_WIDTH);
      this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER,
          this.gl.COLOR_ATTACHMENT0, this.glCubeFaces[key], this._texture, 0);
      this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER,
          this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, rBuffer);
      callback(this.frameBuffers[key],
          this.renderBuffers[key], this.cameras[key],
          CUBE_CAMERA_TEXTURE_WIDTH, CUBE_CAMERA_TEXTURE_WIDTH);
    }
  }

  public translate(dx: number | vec3, dy?: number, dz?: number): void {
    if (typeof dx === 'number') {
      this.position = vec3.add(
          vec3.create(), vec3.fromValues(dx, dy, dz), this.position);
    } else {
      this.position = vec3.add(vec3.create(), dx, this.position);
    }

    for (const key of Object.keys(this.cameras)) {
      this.cameras[key].setEye(this.position);
    }
  }
}
