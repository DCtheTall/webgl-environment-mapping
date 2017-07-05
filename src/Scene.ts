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

export default class Scene {
  private gl: WebGLRenderingContext;
  private camera: Camera;

  private shaderProgram: WebGLProgram;

  private vertexBuffer: WebGLBuffer;
  private vertexIndicesBuffer: WebGLBuffer;

  private normalBuffer: WebGLBuffer;
  private normalIndexBuffer: WebGLBuffer;

  private textureBuffer: WebGLBuffer;
  private textureIndexBuffer: WebGLBuffer;

  constructor(canvas: HTMLCanvasElement) {
    let sideLength: number;

    sideLength = window.innerWidth >= 400 ? 400 : 200;
    canvas.width = sideLength;
    canvas.height = sideLength;

    this.gl = <WebGLRenderingContext>(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    this.gl.viewport(0, 0, canvas.width, canvas.height);
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.camera = new Camera();

    this.vertexBuffer = this.gl.createBuffer();
    this.vertexIndicesBuffer = this.gl.createBuffer();

    this.normalBuffer = this.gl.createBuffer();
    this.normalIndexBuffer = this.gl.createBuffer();

    this.textureBuffer = this.gl.createBuffer();
    this.textureIndexBuffer = this.gl.createBuffer();
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

  public initShaderProgram(): Promise<void> {
    let vertexShaderSource: string;
    let fragmentShaderSource: string;

    let vertexShader: WebGLShader;
    let fragmentShader: WebGLShader;

    let shaderProgram: WebGLProgram;

    return axios
      .get('/shaders/vertex.glsl')
      .then((res: AxiosResponse) => {
        vertexShaderSource = res.data;
        return axios.get('/shaders/fragment.glsl');
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

        this.shaderProgram = shaderProgram;
      });
  }

  public bindCubeTexture(cube: Cube): void {
    let texture: WebGLTexture;

    texture = this.gl.createTexture();

    this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, texture);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, cube.cubeTexture.left);
    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, cube.cubeTexture.right);
    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, cube.cubeTexture.bottom);
    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, cube.cubeTexture.top);
    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, cube.cubeTexture.back);
    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, cube.cubeTexture.front);
    this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);

    this.gl.activeTexture(this.gl.TEXTURE0);
  }

  private sendVecAttribute(dimension: number, buffer: WebGLBuffer, attrLocation: number, values: Float32Array): void {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.vertexAttribPointer(attrLocation, dimension, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(attrLocation);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, values, this.gl.DYNAMIC_DRAW);
  }

  private sendAttributeData(model: Model, shaderProgram: WebGLProgram): void {
    let aPosition: number;
    let aNormal: number;
    let aTexCoord: number;
    let aTexDirection: number;

    aPosition = this.gl.getAttribLocation(shaderProgram, 'a_Position');
    aNormal = this.gl.getAttribLocation(shaderProgram, 'a_Normal');
    if (model.textureUVs) aTexCoord = this.gl.getAttribLocation(shaderProgram, 'a_TexCoord');
    if (model.texDirections) aTexDirection = this.gl.getAttribLocation(shaderProgram, 'a_TexDirection');

    this.sendVecAttribute(3, this.vertexBuffer, aPosition, model.vertices);
    this.sendVecAttribute(3, this.normalBuffer, aNormal, model.normals);

    if (model.textureUVs) {
      this.sendVecAttribute(2, this.textureBuffer, aTexCoord, model.textureUVs);
    }

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.normalIndexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, model.indices, this.gl.DYNAMIC_DRAW);
  }

  private sendMatrixUniforms(model: Model): void {
    interface uniform {
      name: string;
      matrix: mat4;
    }

    let uniforms: uniform[];

    uniforms = [
      { name: 'u_ModelMat', matrix: model.modelMat() },
      { name: 'u_NormalMat', matrix: model.normalMat() },
      { name: 'u_PerspectiveMat', matrix: this.camera.perspectiveMat },
      { name: 'u_ViewMat', matrix: this.camera.getLookAt() },
    ];

    uniforms.forEach((u: uniform) => {
      let uniformLocation: WebGLUniformLocation;
      uniformLocation = this.gl.getUniformLocation(this.shaderProgram, u.name);
      this.gl.uniformMatrix4fv(uniformLocation, false, u.matrix);
    });
  }

  private sendSkyboxUniforms(skyBox: Cube): void {
    let uUseTexture: WebGLUniformLocation;
    let uSampler: WebGLUniformLocation;

    this.sendMatrixUniforms(skyBox);

    uUseTexture = this.gl.getUniformLocation(this.shaderProgram, 'u_UseTexture');
    this.gl.uniform1i(uUseTexture, Number(skyBox.useTexture));

    uSampler = this.gl.getUniformLocation(this.shaderProgram, 'u_Sampler');
    this.gl.uniform1i(uSampler, 0);
  }

  private sendUniformData(model: Model): void {
    let uUseLighting: WebGLUniformLocation;
    let uUseTexture: WebGLUniformLocation;

    let uAmbientMaterialColor: WebGLUniformLocation;
    let uLambertianMaterialColor: WebGLUniformLocation;
    let uSpecularMaterialColor: WebGLUniformLocation;

    let uSampler: WebGLUniformLocation;

    let cameraEye: WebGLUniformLocation;
    let cameraAt: WebGLUniformLocation;

    this.sendMatrixUniforms(model);

    uUseLighting = this.gl.getUniformLocation(this.shaderProgram, 'u_UseLighting');
    this.gl.uniform1i(uUseLighting, Number(model.useLighting));

    uUseTexture = this.gl.getUniformLocation(this.shaderProgram, 'u_UseTexture');
    this.gl.uniform1i(uUseTexture, Number(model.useTexture));

    uAmbientMaterialColor = this.gl.getUniformLocation(this.shaderProgram, 'u_AmbientMaterialColor');
    this.gl.uniform3fv(uAmbientMaterialColor, model.ambientMaterialColor);

    uLambertianMaterialColor = this.gl.getUniformLocation(this.shaderProgram, 'u_LambertianMaterialColor');
    this.gl.uniform3fv(uLambertianMaterialColor, model.lambertianMaterialColor);

    uSpecularMaterialColor = this.gl.getUniformLocation(this.shaderProgram, 'u_SpecularMaterialColor');
    this.gl.uniform3fv(uSpecularMaterialColor, model.specularMaterialColor);

    cameraEye = this.gl.getUniformLocation(this.shaderProgram, 'cameraEye');
    this.gl.uniform3fv(cameraEye, this.camera.getEye());

    cameraAt = this.gl.getUniformLocation(this.shaderProgram, 'cameraAt');
    this.gl.uniform3fv(cameraAt, this.camera.getAt());

    uSampler = this.gl.getUniformLocation(this.shaderProgram, 'u_Sampler');
    this.gl.uniform1i(uSampler, 0);
  }

  public renderSkyBox(skyBox: Cube): void {
    this.gl.useProgram(this.shaderProgram);
    this.sendAttributeData(skyBox, this.shaderProgram);
    this.sendSkyboxUniforms(skyBox);
    if (skyBox.useTexture) this.bindCubeTexture(skyBox);

    this.gl.drawElements(this.gl.TRIANGLES, skyBox.indices.length, this.gl.UNSIGNED_SHORT, 0);
  }
}
