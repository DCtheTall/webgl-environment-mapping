import { FRAME_RATE } from './constants';
import Frame from './Frame';
import { CubeTexture, CubeFaces } from './Cube';


type AnyFunc = (...args: any[]) => any;


interface DrawSceneParameters {
  animate?: boolean;
  firstRender?: boolean;
}

export default class Scene {
  private lastRender: number;
  private firstRender: number;
  private rendering: boolean;

  private frames: { [index: string]: Frame };
  private textures: { [index: string]: WebGLTexture };
  private glTexCubeFaces: CubeFaces<number>;

  private renderFn: () => void;
  private requestAnimFrame: number;
  private isAnimating: boolean;

  public readonly gl: WebGLRenderingContext;

  static isPowerOfTwo(n: number): boolean {
    return (n & (n - 1)) === 0;
  }

  constructor(public readonly canvas: HTMLCanvasElement) {
    this.gl =
      canvas.getContext('webgl', { preserveDrawingBuffer: true })
      || canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.frames = {};
    this.textures = {};
    this.glTexCubeFaces = {
      'x+': this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      'x-': this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      'y+': this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      'y-': this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      'z+': this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      'z-': this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    };
  }

  public getTexture(key: string): WebGLTexture {
    return this.textures[key];
  }

  public getFrame(key: string): Frame {
    return this.frames[key];
  }

  public getTimeSinceFirstRender(animate: boolean): number {
    if (!animate) return 0;
    return -(Date.now() - this.firstRender) / 100;
  }

  public getIsAnimating(): boolean {
    return this.isAnimating;
  }

  public init2DTexture(
    key: string,
    src: HTMLImageElement|HTMLCanvasElement,
  ) {
    const texture = this.gl.createTexture();

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(
        this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, src);

    if (Scene.isPowerOfTwo(src.width) && Scene.isPowerOfTwo(src.height)) {
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
    } else {
      this.gl.texParameteri(
          this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(
          this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(
          this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(
          this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    }
    this.textures[key] = texture;
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  public initCubeTexture(key: string, src: CubeTexture) {
    const texture = this.gl.createTexture();

    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, texture);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);

    Object.keys(this.glTexCubeFaces).map((key: string) => {
      const cubeFace = this.glTexCubeFaces[key];
      this.gl.texImage2D(
        cubeFace, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, src[key]);
    });

    this.textures[key] = texture;
  }

  public async loadCubeTexture(key: string, cubeTextureUrls: CubeFaces<string>) {
    const cubeTexture = <CubeTexture>{
      'x+': null, 'x-': null,
      'y+': null, 'y-': null,
      'z+': null, 'z-': null,
    };
    await Promise.all(
      Object.keys(cubeTextureUrls).map(
        k => new Promise((resolve: AnyFunc) => {
          const img = cubeTexture[k] = new Image();
          img.src = cubeTextureUrls[k];
          img.onload = resolve;
        })));
    this.initCubeTexture(key, cubeTexture);
  }

  public setFrame(
    key: string,
    frame: Frame | ((gl: WebGLRenderingContext) => Frame),
  ) {
    this.frames[key] = typeof frame === 'function' ? frame(this.gl) : frame;
  }

  public toggleAnimation() {
    this.isAnimating = !this.isAnimating;
    if (this.isAnimating) {
      this.renderFn();
    } else {
      window.cancelAnimationFrame(this.requestAnimFrame);
      this.requestAnimFrame = null;
    }
  }

  public render({
    animate = false,
    draw = (_: DrawSceneParameters) => { },
  }) {
    this.isAnimating = animate;
    this.renderFn = (function renderScene() {
      const now = Date.now();
      if (!this.lastRender) this.firstRender = now;
      if (
        this.rendering
        || (
          this.lastRender
          && ((now - this.lastRender) < (1000 / FRAME_RATE))
        )
      ) {
        if (this.isAnimating) {
          this.requestAnimFrame = window.requestAnimationFrame(this.renderFn);
        }
        return;
      }
      this.rendering = true;
      draw({ animate, firstRender: !this.lastRender });
      this.rendering = false;
      this.lastRender = Date.now();
      if (this.isAnimating) {
        this.requestAnimFrame = window.requestAnimationFrame(this.renderFn);
      }
    }).bind(this);
    if (animate) {
      window.requestAnimationFrame(this.renderFn);
    } else {
      this.renderFn();
    }
  }
}
