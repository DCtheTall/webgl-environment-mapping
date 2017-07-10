import axios, { AxiosResponse } from 'axios';
import * as BluebirdPromise from 'bluebird';
import {
  vec3,
  vec4,
  mat4,
} from 'gl-matrix';
import Camera from './Camera';
import Model from './Model';
import Cube from './Cube';
import CubeFaces from './CubeFaces';

interface Framebuffer extends WebGLFramebuffer {
  width: number;
  height: number;
}

interface uniform {
  name: string;
  matrix: mat4;
}

export default class Scene {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private camera: Camera;
  private skyBox: Cube;
  private models: Model[];
  private reflectiveModel: Model;

  private glTextureCubeFaces: CubeFaces<number>;

  private skyboxShaderProgram: WebGLProgram;
  private reflShaderProgram: WebGLProgram;

  private skyboxTexture: WebGLTexture;
  private reflectionTexture: WebGLTexture;

  private vertexBuffer: WebGLBuffer;
  private normalBuffer: WebGLBuffer;
  private indicesBuffer: WebGLBuffer;
  private frameBuffers: CubeFaces<Framebuffer>;
  private renderBuffers: CubeFaces<WebGLRenderbuffer>;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = <WebGLRenderingContext>(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.viewport(0, 0, canvas.width, canvas.height);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.models = [];
    this.glTextureCubeFaces = {
      left: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      right: this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      bottom: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      top: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      back: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      front: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    };

    this.vertexBuffer = this.gl.createBuffer();
    this.indicesBuffer = this.gl.createBuffer();
    this.normalBuffer = this.gl.createBuffer();
    this.frameBuffers = {
      top: <Framebuffer>this.gl.createFramebuffer(),
      bottom: <Framebuffer>this.gl.createFramebuffer(),
      left: <Framebuffer>this.gl.createFramebuffer(),
      right: <Framebuffer>this.gl.createFramebuffer(),
      front: <Framebuffer>this.gl.createFramebuffer(),
      back: <Framebuffer>this.gl.createFramebuffer(),
    };
    Object.keys(this.frameBuffers).forEach((key: string) => {
      this.frameBuffers[key].width = 32;
      this.frameBuffers[key].height = 32;
    });
    this.renderBuffers = {
      top: this.gl.createRenderbuffer(),
      bottom: this.gl.createRenderbuffer(),
      left: this.gl.createRenderbuffer(),
      right: this.gl.createRenderbuffer(),
      front: this.gl.createRenderbuffer(),
      back: this.gl.createRenderbuffer(),
    };
  }

  public addCamera(camera: Camera): void {
    this.camera = camera;
  }

  public addSkyBox(skyBox: Cube): void {
    this.skyBox = skyBox;
    this.skyboxTexture = this.gl.createTexture();

    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.skyboxTexture);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    Object.keys(this.glTextureCubeFaces).forEach((key: string) => {
      this.gl.texImage2D(this.glTextureCubeFaces[key], 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.skyBox.cubeTexture[key]);
    });

    this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
  }

  public addModel(model: Model): void {
    this.models.push(model);
  }

  public addReflectiveModel(model: Model): void {
    this.reflectiveModel = model;

    this.reflectionTexture = this.gl.createTexture();

    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.reflectionTexture);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    Object.keys(this.glTextureCubeFaces).forEach((key: string) => {
      let frameBuffer: Framebuffer;
      frameBuffer = this.frameBuffers[key];
      this.gl.texImage2D(this.glTextureCubeFaces[key], 0, this.gl.RGBA, frameBuffer.width, frameBuffer.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
    });
  }

  private compileShader(shaderSource: string, shaderType: number): WebGLShader {
    let shader: WebGLShader;

    shader = this.gl.createShader(shaderType);

    this.gl.shaderSource(shader, shaderSource);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(`Shader failed to compile: ${this.gl.getShaderInfoLog(shader)}`);
      console.log('Shader code:', shaderSource);
      return null;
    }

    return shader;
  }

  private initShaderProgram(vertexUrl: string, fragmentUrl: string): Promise<WebGLProgram> {
    let vertexShaderSource: string;
    let fragmentShaderSource: string;

    let vertexShader: WebGLShader;
    let fragmentShader: WebGLShader;

    let shaderProgram: WebGLProgram;

    return axios
      .get(vertexUrl)
      .then((res: AxiosResponse) => {
        vertexShaderSource = res.data;
        return axios.get(fragmentUrl);
      })
      .then((res: AxiosResponse) => {
        fragmentShaderSource = res.data;

        vertexShader = this.compileShader(vertexShaderSource, this.gl.VERTEX_SHADER);
        fragmentShader = this.compileShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER);

        if (vertexShader === null || fragmentShader === null) {
          throw new Error('Shader failed to compile. See error message for details.');
        }

        shaderProgram = this.gl.createProgram();

        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.linkProgram(shaderProgram);

        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
          throw new Error('Could not initialize shader program.');
        }

        return shaderProgram;
      });
  }

  public loadShaders(): Promise<void> {
    return this.initShaderProgram('/shaders/skybox-vertex.glsl', '/shaders/skybox-fragment.glsl')
      .then((shaderProgram: WebGLProgram) => {
        this.skyboxShaderProgram = shaderProgram;
        return this.initShaderProgram('/shaders/refl-vertex.glsl', '/shaders/refl-fragment.glsl');
      })
      .then((shaderProgram: WebGLProgram) => {
        this.reflShaderProgram = shaderProgram;
      });
  }

  private sendVecAttribute(dimension: number, buffer: WebGLBuffer, attrLocation: number, values: Float32Array): void {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.vertexAttribPointer(attrLocation, dimension, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(attrLocation);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, values, this.gl.DYNAMIC_DRAW);
  }

  private sendSkyboxAttributes(): void {
    let aPosition: number;

    aPosition = this.gl.getAttribLocation(this.skyboxShaderProgram, 'a_Position');
    this.sendVecAttribute(3, this.vertexBuffer, aPosition, this.skyBox.vertices);

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.skyBox.indices, this.gl.DYNAMIC_DRAW);
  }

  private sendModelAttributes(model: Model): void {
    let aPosition: number;
    let aNormal: number;

    aPosition = this.gl.getAttribLocation(this.reflShaderProgram, 'a_Position');
    aNormal = this.gl.getAttribLocation(this.reflShaderProgram, 'a_Normal');

    this.sendVecAttribute(3, this.vertexBuffer, aPosition, model.vertices);
    this.sendVecAttribute(3, this.normalBuffer, aNormal, model.normals);

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, model.indices, this.gl.DYNAMIC_DRAW);
  }

  private sendMatrixUniforms(shaderProgram: WebGLProgram, uniforms: uniform[]): void {
    uniforms.forEach((u: uniform) => {
      let uniformLocation: WebGLUniformLocation;
      uniformLocation = this.gl.getUniformLocation(shaderProgram, u.name);
      this.gl.uniformMatrix4fv(uniformLocation, false, u.matrix);
    });
  }

  private sendSamplerUniform(shaderProgram: WebGLProgram) {
    let uSampler: WebGLUniformLocation;
    uSampler = this.gl.getUniformLocation(shaderProgram, 'u_Sampler');
    this.gl.uniform1i(uSampler, 0);
  }

  private sendSkyboxUniforms(camera: Camera): void {
    this.sendMatrixUniforms(this.skyboxShaderProgram, [
      { name: 'u_ModelMat', matrix: this.skyBox.modelMat() },
      { name: 'u_PerspectiveMat', matrix: camera.perspectiveMat },
      { name: 'u_ViewMat', matrix: camera.getLookAt() },
    ]);
    this.sendSamplerUniform(this.skyboxShaderProgram);
  }

  private sendModelUniforms(shaderProgram: WebGLProgram, model: Model, camera: Camera): void {
    let uAmbientMaterialColor: WebGLUniformLocation;
    let uLambertianMaterialColor: WebGLUniformLocation;
    let uSpecularMaterialColor: WebGLUniformLocation;
    let uCameraEye: WebGLUniformLocation;
    let uSampler: WebGLUniformLocation;

    this.sendMatrixUniforms(shaderProgram, [
      { name: 'u_ModelMat', matrix: model.modelMat() },
      { name: 'u_NormalMat', matrix: model.normalMat() },
      { name: 'u_PerspectiveMat', matrix: camera.perspectiveMat },
      { name: 'u_ViewMat', matrix: camera.getLookAt() },
    ]);

    uAmbientMaterialColor = this.gl.getUniformLocation(shaderProgram, 'u_AmbientMaterialColor');
    this.gl.uniform3fv(uAmbientMaterialColor, model.ambientMaterialColor);

    uLambertianMaterialColor = this.gl.getUniformLocation(shaderProgram, 'u_LambertianMaterialColor');
    this.gl.uniform3fv(uLambertianMaterialColor, model.lambertianMaterialColor);

    uSpecularMaterialColor = this.gl.getUniformLocation(shaderProgram, 'u_SpecularMaterialColor');
    this.gl.uniform3fv(uSpecularMaterialColor, model.specularMaterialColor);

    uCameraEye = this.gl.getUniformLocation(shaderProgram, 'u_CameraEye');
    this.gl.uniform3fv(uCameraEye, camera.getEye());

    this.sendSamplerUniform(shaderProgram);
  }

  private renderSkyBox(camera: Camera): void {
    this.gl.useProgram(this.skyboxShaderProgram);
    this.sendSkyboxAttributes();
    this.sendSkyboxUniforms(camera);
    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.skyboxTexture);

    this.gl.drawElements(this.gl.TRIANGLES, this.skyBox.indices.length, this.gl.UNSIGNED_SHORT, 0);
  }

  private renderEnvironment(_camera?: Camera): void {
    let camera: Camera;

    if (_camera) camera = _camera;
    else camera = this.camera;

    if (this.skyBox) this.renderSkyBox(camera);
  }

  private renderReflectiveObject(): void {
    let model: Model;

    model = this.reflectiveModel;

    Object.keys(this.frameBuffers).forEach((key: string) => {
      let frameBuffer: Framebuffer;
      let renderBuffer: WebGLRenderbuffer;
      let camera: Camera;

      frameBuffer = this.frameBuffers[key];
      renderBuffer = this.renderBuffers[key];
      camera = model.cubeCamera.cameras[key];

      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer);
      this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, renderBuffer);
      this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, frameBuffer.width, frameBuffer.height);
      this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.glTextureCubeFaces[key], this.reflectionTexture, 0);
      this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, renderBuffer);

      this.gl.viewport(0, 0, frameBuffer.width, frameBuffer.height);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

      this.renderEnvironment(camera);
    });

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);

    this.gl.useProgram(this.reflShaderProgram);
    this.sendModelAttributes(model);
    this.sendModelUniforms(this.reflShaderProgram, model, this.camera);

    this.gl.drawElements(this.gl.TRIANGLES, model.indices.length, this.gl.UNSIGNED_SHORT, 0);
  }

  public render() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.renderEnvironment();
    this.renderReflectiveObject();
  }
}
