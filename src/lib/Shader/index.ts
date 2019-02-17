import { ShaderAttribute } from './ShaderAttribute';
import { ShaderUniform } from './ShaderUniform';

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
    private readonly attributes: ShaderAttributes = {},
    private readonly uniforms: ShaderUniforms = {},
  ) {
    this.shaderSources[WebGLRenderingContext.VERTEX_SHADER] = vertexShader;
    this.shaderSources[WebGLRenderingContext.FRAGMENT_SHADER] = fragmentShader;
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
      attribute.setLocation(gl.getAttribLocation(this.program, attribute.getLocationName()));
    });
    Object.keys(this.uniforms).forEach((key: string) => {
      const uniform = this.uniforms[key];
      uniform.setLocation(gl.getUniformLocation(this.program, uniform.getLocationName()));
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
}
