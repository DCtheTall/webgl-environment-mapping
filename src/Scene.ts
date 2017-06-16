import axios, { AxiosResponse } from 'axios';
import * as BluebirdPromise from 'bluebird';
import {
  vec3,
  vec4,
} from 'gl-matrix';
import Camera from './Camera';
import Model from './Model';

interface Lights {
  color: vec4;
  position: vec3;
}

export default class Scene {
  private gl: WebGLRenderingContext;
  private camera: Camera;
  private envShaderProgram: WebGLProgram;

  private vertexBuffer: WebGLBuffer;
  private vertexIndicesBuffer: WebGLBuffer;

  private normalBuffer: WebGLBuffer;
  private normalIndexBuffer: WebGLBuffer;

  private lights: Lights[];

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

  private sendEnvAttributeData(model: Model) {
    let aPosition: number;
    let aNormal: number;

    aPosition = this.gl.getAttribLocation(this.envShaderProgram, 'a_Position');
    aNormal = this.gl.getAttribLocation(this.envShaderProgram, 'a_Normal');

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(aPosition, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(aPosition);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, model.vertices, this.gl.DYNAMIC_DRAW);

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
    this.gl.vertexAttribPointer(aNormal, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(aNormal);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, model.normals, this.gl.DYNAMIC_DRAW);

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.normalIndexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, model.indices, this.gl.DYNAMIC_DRAW);
  }

  private sendEnvUniformData(model: Model) {
    let modelMat: WebGLUniformLocation;
    let normalMat: WebGLUniformLocation;
    let viewMat: WebGLUniformLocation;
    let perspectiveMat: WebGLUniformLocation;

    let uAmbient: WebGLUniformLocation;
    let uLambertian: WebGLUniformLocation;
    let uSpecular: WebGLUniformLocation;

    let cameraEye: WebGLUniformLocation;
    let cameraAt: WebGLUniformLocation;

    modelMat = this.gl.getUniformLocation(this.envShaderProgram, 'modelMat');
    this.gl.uniformMatrix4fv(modelMat, false, model.modelMat());

    normalMat = this.gl.getUniformLocation(this.envShaderProgram, 'normalMat');
    this.gl.uniformMatrix4fv(normalMat, false, model.normalMat());

    viewMat = this.gl.getUniformLocation(this.envShaderProgram, 'viewMat');
    this.gl.uniformMatrix4fv(viewMat, false, this.camera.getLookAt());

    perspectiveMat = this.gl.getUniformLocation(this.envShaderProgram, 'perspectiveMat');
    this.gl.uniformMatrix4fv(perspectiveMat, false, this.camera.perspectiveMat);

    uAmbient = this.gl.getUniformLocation(this.envShaderProgram, 'u_Ambient');
    this.gl.uniform1f(uAmbient, model.ambient);

    uLambertian = this.gl.getUniformLocation(this.envShaderProgram, 'u_Lambertian');
    this.gl.uniform1f(uLambertian, model.lambertian);

    uSpecular = this.gl.getUniformLocation(this.envShaderProgram, 'u_Specular');
    this.gl.uniform1f(uSpecular, model.specular);

    cameraEye = this.gl.getUniformLocation(this.envShaderProgram, 'cameraEye');
    this.gl.uniform3fv(cameraEye, this.camera.getEye());

    cameraAt = this.gl.getUniformLocation(this.envShaderProgram, 'cameraAt');
    this.gl.uniform3fv(cameraAt, this.camera.getAt());
  }

  public initEnvironmentShaders(): Promise<void> {
    let vertexShaderSource: string;
    let fragmentShaderSource: string;

    let vertexShader: WebGLShader;
    let fragmentShader: WebGLShader;

    return axios
      .get('/vertex.glsl')
      .then((res: AxiosResponse) => {
        vertexShaderSource = res.data;
        return axios.get('/fragment.glsl');
      })
      .then((res: AxiosResponse) => {
        fragmentShaderSource = res.data;

        vertexShader = this.compileShader(vertexShaderSource, this.gl.VERTEX_SHADER);
        fragmentShader = this.compileShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER);

        if (vertexShader === null || fragmentShader === null) {
          throw new Error('Shader failed to compile. See error message for details.');
        }

        this.envShaderProgram = this.gl.createProgram();

        this.gl.attachShader(this.envShaderProgram, vertexShader);
        this.gl.attachShader(this.envShaderProgram, fragmentShader);
        this.gl.linkProgram(this.envShaderProgram);

        if (!this.gl.getProgramParameter(this.envShaderProgram, this.gl.LINK_STATUS)) {
          throw new Error('Could not initialize shader program.');
        }

        return BluebirdPromise.resolve();
      })
      .catch(console.error);
  }

  public renderEnvironment(teapot: Model) {
    this.gl.useProgram(this.envShaderProgram);

    this.sendEnvAttributeData(teapot);
    this.sendEnvUniformData(teapot);

    this.gl.drawElements(this.gl.TRIANGLES, teapot.indices.length, this.gl.UNSIGNED_SHORT, 0);
  }
}
