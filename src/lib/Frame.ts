import Shader from './Shader';

interface FrameOptions {
  mode?: number;
  clearBeforeRender?: boolean;
  drawElements?: boolean;
}

export default class Frame {
  private frameBuffer: WebGLFramebuffer;
  private renderBuffer: WebGLRenderbuffer;
  private texture: WebGLTexture;

  public readonly mode: number;
  public readonly clearBeforeRender: boolean;
  public readonly drawElements: boolean;

  constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly shader: Shader,
    options: FrameOptions = {},
  ) {
    this.mode = options.mode || WebGLRenderingContext.TRIANGLE_STRIP;
    this.clearBeforeRender = options.clearBeforeRender === undefined ?
      true : options.clearBeforeRender;
  }

  public init(gl: WebGLRenderingContext) {
    this.frameBuffer = gl.createFramebuffer();
    this.initRenderBuffer(gl);
    this.initTexture(gl);
    this.shader.initShaderProgram(gl);
    this.shader.sendAttributes(gl);
    this.shader.sendUniforms(gl);
  }

  private initRenderBuffer(gl: WebGLRenderingContext) {
    this.renderBuffer = gl.createRenderbuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT16,
      this.width,
      this.height,
    );
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      this.renderBuffer,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  }

  private initTexture(gl: WebGLRenderingContext) {
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.width,
      this.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.texParameteri(
      gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(
      gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(
      gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.texture,
      0,
    );
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}
