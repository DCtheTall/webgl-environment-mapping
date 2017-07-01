import axios, { AxiosResponse } from 'axios';
import * as BluebirdPromise from 'bluebird';
import {
  vec3,
  vec4,
} from 'gl-matrix';
import Camera from './Camera';
import Model from './Model';

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

  public bindModelTexture(model: Model) {
    let texture: WebGLTexture;

    texture = this.gl.createTexture();

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, model.texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
  }

  private sendVec3Attribute(buffer: WebGLBuffer, attrLocation: number, values: Float32Array): void {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.vertexAttribPointer(attrLocation, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(attrLocation);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, values, this.gl.DYNAMIC_DRAW);
  }

  private sendAttributeData(model: Model) {
    let aPosition: number;
    let aNormal: number;
    let aTexCoord: number;

    aPosition = this.gl.getAttribLocation(this.shaderProgram, 'a_Position');
    aNormal = this.gl.getAttribLocation(this.shaderProgram, 'a_Normal');
    aTexCoord = this.gl.getAttribLocation(this.shaderProgram, 'a_TexCoord');

    this.sendVec3Attribute(this.vertexBuffer, aPosition, model.vertices);
    this.sendVec3Attribute(this.normalBuffer, aNormal, model.normals);

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.normalIndexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, model.indices, this.gl.DYNAMIC_DRAW);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer);
    this.gl.vertexAttribPointer(aTexCoord, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(aTexCoord);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, model.textureUVs, this.gl.DYNAMIC_DRAW);
  }

  private sendUniformData(model: Model) {
    let modelMat: WebGLUniformLocation;
    let normalMat: WebGLUniformLocation;
    let viewMat: WebGLUniformLocation;
    let perspectiveMat: WebGLUniformLocation;

    let uUseLighting: WebGLUniformLocation;
    let uUseTexture: WebGLUniformLocation;

    let uAmbientMaterialColor: WebGLUniformLocation;
    let uLambertianMaterialColor: WebGLUniformLocation;
    let uSpecularMaterialColor: WebGLUniformLocation;

    let uSampler: WebGLUniformLocation;

    let cameraEye: WebGLUniformLocation;
    let cameraAt: WebGLUniformLocation;

    modelMat = this.gl.getUniformLocation(this.shaderProgram, 'modelMat');
    this.gl.uniformMatrix4fv(modelMat, false, model.modelMat());

    normalMat = this.gl.getUniformLocation(this.shaderProgram, 'normalMat');
    this.gl.uniformMatrix4fv(normalMat, false, model.normalMat());

    viewMat = this.gl.getUniformLocation(this.shaderProgram, 'viewMat');
    this.gl.uniformMatrix4fv(viewMat, false, this.camera.getLookAt());

    perspectiveMat = this.gl.getUniformLocation(this.shaderProgram, 'perspectiveMat');
    this.gl.uniformMatrix4fv(perspectiveMat, false, this.camera.perspectiveMat);

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

  public renderEnvironment(teapot: Model) {
    this.gl.useProgram(this.shaderProgram);

    this.sendAttributeData(teapot);
    this.sendUniformData(teapot);
    if (teapot.useTexture) this.bindModelTexture(teapot);

    this.gl.drawElements(this.gl.TRIANGLES, teapot.indices.length, this.gl.UNSIGNED_SHORT, 0);
  }
}
