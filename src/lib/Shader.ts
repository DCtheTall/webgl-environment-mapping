enum ShaderProgramTypes {
  BOOL,
  FLOAT,
  INTEGER,
  MATRIX4,
  VECTOR2,
  VECTOR3,
  VECTOR4,
}

interface ShaderData {
  locationName: string;
  type?: ShaderProgramTypes;
  data?: number|number[]|Float32Array;
  buffer?: WebGLBuffer;
}

export interface ShaderAttribute extends ShaderData {
  location?: number;
}

export interface ShaderUniform extends ShaderData {
  location?: WebGLUniformLocation;
}


interface ShaderConstructorParams {
  gl: WebGLRenderingContext;
  vertexShader: string;
  fragmentShader: string;
  attributes?: {
    [index: string]: ShaderAttribute;
  };
  uniforms?: {
    [index: string]: ShaderUniform;
  };
}


export default class Shader {
  static Types = ShaderProgramTypes;

  private gl: WebGLRenderingContext;
  private shaderSources: string[];
  private program: WebGLProgram;
  private attributes: { [index: string]: ShaderAttribute };
  private uniforms: { [index: string]: ShaderUniform };

  constructor({
    gl,
    vertexShader,
    fragmentShader,
    attributes = {},
    uniforms = {},
  }: ShaderConstructorParams) {
    const addLineNumbers = (shader: string) =>
      shader.split('\n').map((s: string, i: number) => `${i + 1}. ${s}`).join('\n');
    if ((<any>window).__DEV__) {
      console.log('VERTEX SHADER:\n', addLineNumbers(vertexShader), '\n');
      console.log('FRAGMENT SHADER:\n', addLineNumbers(fragmentShader), '\n');
    }
    this.gl = gl;
    this.shaderSources = [];
    this.shaderSources[this.gl.VERTEX_SHADER] = vertexShader;
    this.shaderSources[this.gl.FRAGMENT_SHADER] = fragmentShader;
    this.attributes = attributes;
    this.uniforms = uniforms;
    this.initShaderProgram();
  }

  private compileShader(shaderSource: string, shaderType: number): WebGLShader {
    const shader = this.gl.createShader(shaderType);
    this.gl.shaderSource(shader, shaderSource);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(`Shader failed to compile: ${this.gl.getShaderInfoLog(shader)}`);
      return null;
    }
    return shader;
  }

  private initShaderProgram() {
    const shaders = <WebGLShader[]>[];
    const program = this.gl.createProgram();
    this.shaderSources.forEach((source: string, type: number) => {
      const shader = this.compileShader(source, type);
      if (shader === null) {
        throw new Error('Shader failed to compile. See error message for details.');
      }
      shaders[type] = shader;
    });
    this.gl.attachShader(program, shaders[this.gl.VERTEX_SHADER]);
    this.gl.attachShader(program, shaders[this.gl.FRAGMENT_SHADER]);
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw new Error('Could not initialize shader program.');
    }
    this.program = program;
    Object.keys(this.attributes).forEach((key: string) => {
      const attribute = this.attributes[key];
      const { locationName } = attribute;
      attribute.buffer = this.gl.createBuffer();
      attribute.location = this.gl.getAttribLocation(this.program, locationName);
    });
    Object.keys(this.uniforms).forEach((key: string) => {
      const uniform = this.uniforms[key];
      const { locationName } = uniform;
      uniform.location = this.gl.getUniformLocation(this.program, locationName);
    });
  }

  private sendVectorAttribute(
    dimension: number,
    attribute: ShaderAttribute,
    {
      firstRender = true,
    } = {},
  ): void {
    const { data, buffer, location } = attribute;
    if (typeof data === 'number')
      throw new Error('You must use number[] type for data for vector attribute.');
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.enableVertexAttribArray(location);
    this.gl.vertexAttribPointer(
      location, dimension, this.gl.FLOAT, false, 0, 0);
    if (firstRender) {
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER, new Float32Array(<number[]>data), this.gl.STATIC_DRAW);
    }
  }

  public sendAttributes(firstRender: boolean) {
    Object.keys(this.attributes).forEach((key: string) => {
      const attribute = this.attributes[key];
      switch (attribute.type) {
        case ShaderProgramTypes.VECTOR2:
          this.sendVectorAttribute(2, attribute, { firstRender });
          break;
        default:
          throw new Error(`Invalid type provided for attribute ${key} provided.`);
      }
    })
  }

  public sendUniforms() {
    Object.keys(this.uniforms).forEach((key: string) => {
      const uniform = this.uniforms[key];
      switch (uniform.type) {
        case ShaderProgramTypes.BOOL:
          this.gl.uniform1i(
            uniform.location, <number>uniform.data);
          break;

        case ShaderProgramTypes.FLOAT:
          this.gl.uniform1f(
            uniform.location, <number>uniform.data);
          break;

        case ShaderProgramTypes.INTEGER:
          this.gl.uniform1i(
            uniform.location, <number>uniform.data);
          break;

        case ShaderProgramTypes.MATRIX4:
          this.gl.uniformMatrix4fv(
            uniform.location, false, <number[]>uniform.data);
          break;

        case ShaderProgramTypes.VECTOR2:
          this.gl.uniform2fv(
            uniform.location, <number[]>uniform.data);
          break;

        case ShaderProgramTypes.VECTOR3:
          this.gl.uniform3fv(
            uniform.location, <number[]>uniform.data);
          break;

        case ShaderProgramTypes.VECTOR4:
          this.gl.uniform4fv(
            uniform.location, <number[]>uniform.data);
          break;

        default:
          throw new Error(`Invalid type provided for uniform ${key} provided.`);
      }
    });
  }

  public setAttributeData(attrbuteName: string, data: number | number[]) {
    this.attributes[attrbuteName].data = data;
  }

  public setUniformData(uniformName: string, data: number | number[]) {
    this.uniforms[uniformName].data = data;
  }

  public useProgram() {
    this.gl.useProgram(this.program);
  }
}
