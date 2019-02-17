import { mat4 } from 'gl-matrix';
import {
  ShaderAttribute,
  VectorAttribute,
  Vector2Attribute,
  Vector3Attribute,
  Vector4Attribute,
} from './ShaderAttribute';
import {
  ShaderUniform,
  BooleanUniform,
  FloatUniform,
  IntegerUniform,
  Matrix4Uniform,
  Vector2Uniform,
  Vector4Uniform,
  Vector3Uniform,
} from './ShaderUniform';

interface ShaderAttributes {
  [index: string]: ShaderAttribute;
}

interface ShaderUniforms {
  [index: string]: ShaderUniform;
}

export default class Shader {
  private readonly shaderSources: string[] = [];
  private program: WebGLProgram;

  constructor(
    vertexShader: string,
    fragmentShader: string,
    public readonly nVertices: number,
    private readonly attributes: ShaderAttributes = {},
    private readonly uniforms: ShaderUniforms = {},
  ) {
    this.shaderSources[WebGLRenderingContext.VERTEX_SHADER] = vertexShader;
    this.shaderSources[WebGLRenderingContext.FRAGMENT_SHADER] = fragmentShader;
  }

  public getProgram() {
    return this.program;
  }

  public initShaderProgram(gl: WebGLRenderingContext) {
    const shaders = <WebGLShader[]>[];
    const program = gl.createProgram();
    this.shaderSources.forEach((source: string, type: number) => {
      const shader = this.compileShader(gl, source, type);
      if (shader === null) {
        throw new Error('Shader failed to compile. See error message for details.');
      }
      shaders[type] = shader;
    });
    gl.attachShader(program, shaders[gl.VERTEX_SHADER]);
    gl.attachShader(program, shaders[gl.FRAGMENT_SHADER]);
    gl.linkProgram(program);
    this.program = program;
    Object.keys(this.attributes).forEach((key: string) => {
      const attribute = this.attributes[key];
      attribute.setBuffer(gl.createBuffer());
      if (attribute.hasIndices()) {
        attribute.setIndicesBuffer(gl.createBuffer());
      }
      attribute.setLocation(gl.getAttribLocation(this.program, attribute.locationName));
    });
    Object.keys(this.uniforms).forEach((key: string) => {
      const uniform = this.uniforms[key];
      uniform.setLocation(gl.getUniformLocation(this.program, uniform.locationName));
    });
  }

  private compileShader(gl: WebGLRenderingContext, source: string, type: number): WebGLShader {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(`Shader failed to compile: ${gl.getShaderInfoLog(shader)}`);
      return null;
    }
    return shader;
  }

  public sendAttributes(gl: WebGLRenderingContext) {
    Object.keys(this.attributes).forEach((key: string) => {
      const attribute = this.attributes[key];

      switch (attribute.constructor) {
        case Vector2Attribute:
          this.sendVectorAttribute(
            gl, 2, <Vector2Attribute>attribute);
          break;

        case Vector3Attribute:
          this.sendVectorAttribute(
            gl, 3, <Vector3Attribute>attribute);
          break;

        case Vector4Attribute:
          this.sendVectorAttribute(
            gl, 4, <Vector4Attribute>attribute);
          break;

        default:
          throw new Error(`Invalid type provided for attribute ${key} provided.`);
      }
    });
  }

  private sendVectorAttribute(
    gl: WebGLRenderingContext,
    dimension: number,
    attribute: VectorAttribute,
  ) {
    gl.bindBuffer(gl.ARRAY_BUFFER, attribute.getBuffer());
    const location = attribute.getLocation();
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(
      location, dimension, gl.FLOAT, false, 0, 0);
    gl.bufferData(
      gl.ARRAY_BUFFER, new Float32Array(attribute.getData()), gl.STATIC_DRAW);
    if (attribute.hasIndices()) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, attribute.getIndicesBuffer());
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER, attribute.getIndices(), gl.DYNAMIC_DRAW);
    }
  }

  public sendUniforms(gl: WebGLRenderingContext) {
    Object.keys(this.uniforms).forEach((key: string) => {
      const uniform = this.uniforms[key];

      switch (uniform.constructor) {
        case BooleanUniform:
          gl.uniform1i(uniform.getLocation(), <number>uniform.getData());
          break;

        case FloatUniform:
          gl.uniform1f(uniform.getLocation(), <number>uniform.getData());
          break;

        case IntegerUniform:
          gl.uniform1i(uniform.getLocation(), <number>uniform.getData());
          break;

        case Matrix4Uniform:
          gl.uniformMatrix4fv(uniform.getLocation(), false, <number[]>uniform.getData());
          break;

        case Vector2Uniform:
          gl.uniform2fv(uniform.getLocation(), <number[]>uniform.getData());
          break;

        case Vector3Uniform:
          gl.uniform3fv(uniform.getLocation(), <number[]>uniform.getData());
          break;

        case Vector4Uniform:
          gl.uniform4fv(uniform.getLocation(), <number[]>uniform.getData());
          break;

        default:
          throw new Error(`Invalid type provided for uniform ${key} provided.`);
      }
    });
  }

  public setAttributeData(
    gl: WebGLRenderingContext,
    attrbuteName: string,
    data: number | number[] | Float32Array,
    indices?: Uint16Array,
  ) {
    const attr = this.attributes[attrbuteName];
    attr.setData(data);
    if (indices) {
      attr.setIndices(indices);
      if (!attr.hasIndicesBuffer()) {
        attr.setIndicesBuffer(gl.createBuffer());
      }
    }
  }

  public setUniformData(uniformName: string, data: number | number[] | mat4 | Float32Array) {
    this.uniforms[uniformName].setData(data);
  }
}
