import axios, { AxiosResponse } from 'axios';
import * as BluebirdPromise from 'bluebird';
import Camera from './Camera';
import Model from './Model';

export default class Scene {
  private _ASPECT_RATIO: number = 1;

  private gl: WebGLRenderingContext;
  private camera: Camera;
  private envShaderProgram: WebGLProgram;

  private vertexBuffer: WebGLBuffer;
  private vertexIndicesBuffer: WebGLBuffer;

  constructor(canvas: HTMLCanvasElement) {
    this.gl = <WebGLRenderingContext>(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    this.gl.viewport(0, 0, canvas.width, canvas.height);
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.camera = new Camera();

    this.vertexBuffer = this.gl.createBuffer();
    this.vertexIndicesBuffer = this.gl.createBuffer();
  }

  private compileShader(shaderSource: string, shaderType: number): WebGLShader {
    let shader: WebGLShader;

    shader = this.gl.createShader(shaderType);

    this.gl.shaderSource(shader, shaderSource);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(`Shader failed to compile: ${this.gl.getShaderInfoLog(shader)}`);
      return null;
    }

    return shader;
  }

  /**
   * initEnvironmentShaders create shader for environment around reflective object
   */
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

  private sendEnvAttributeData(model: Model) {
    let aPosition: number;

    aPosition = this.gl.getAttribLocation(this.envShaderProgram, 'a_Position');

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(aPosition, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(aPosition);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, model.vertices, this.gl.DYNAMIC_DRAW);

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndicesBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, model.vertexIndices, this.gl.DYNAMIC_DRAW);
  }

  private sendEnvUniformData(model: Model) {
    let modelMat: WebGLUniformLocation;
    let viewMat: WebGLUniformLocation;
    let perspectiveMat: WebGLUniformLocation;

    modelMat = this.gl.getUniformLocation(this.envShaderProgram, 'modelMat');
    this.gl.uniformMatrix4fv(modelMat, false, model.modelMat);

    viewMat = this.gl.getUniformLocation(this.envShaderProgram, 'viewMat');
    this.gl.uniformMatrix4fv(viewMat, false, this.camera.getLookAt());

    perspectiveMat = this.gl.getUniformLocation(this.envShaderProgram, 'perspectiveMat');
    this.gl.uniformMatrix4fv(perspectiveMat, false, this.camera.perspectiveMat);
  }

  public renderEnvironment(teapot: Model) {
    this.gl.useProgram(this.envShaderProgram);

    this.sendEnvAttributeData(teapot);
    this.sendEnvUniformData(teapot);

    this.gl.drawElements(this.gl.TRIANGLES, teapot.vertexIndices.length, this.gl.UNSIGNED_SHORT, 0);
  }
}
