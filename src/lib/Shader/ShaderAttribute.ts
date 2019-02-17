import ShaderData, { ShaderDataOptions } from './ShaderData';

interface ShaderAttributeOptions extends ShaderDataOptions {
  location?: number;
  indices?: Uint16Array;
  indicesBuffer?: WebGLBuffer;
}

class ShaderAttribute extends ShaderData {
  protected location: number;
  protected indices: Uint16Array;
  protected indicesBuffer: WebGLBuffer;

  constructor(
    protected readonly locationName: string,
    {
      location,
      indices,
      indicesBuffer,
      ...opts
    }: ShaderAttributeOptions = {},
  ) {
    super(locationName, opts);
    this.location = location;
    this.indices = indices;
    this.indicesBuffer = indicesBuffer;
  }
}

interface VectorShaderAttributeOptions extends ShaderAttributeOptions {
  data?: number[];
}

class VectorAttribute extends ShaderAttribute {
  protected data: number[] | Float32Array;

  constructor(
    protected readonly locationName: string,
    opts: VectorShaderAttributeOptions = {},
  ) {
    super(locationName, opts);
  }
}