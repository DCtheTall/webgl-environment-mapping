import ShaderData, { ShaderDataOptions } from './ShaderData';

interface ShaderAttributeOptions extends ShaderDataOptions {
  indices?: Uint16Array;
}

export class ShaderAttribute extends ShaderData {
  protected buffer: WebGLBuffer;
  protected location: number;
  protected indices: Uint16Array;
  protected indicesBuffer: WebGLBuffer;

  constructor(
    protected readonly locationName: string,
    {
      indices,
      ...opts
    }: ShaderAttributeOptions = {},
  ) {
    super(locationName, opts);
    this.indices = indices;
  }

  public setBuffer(buffer: WebGLBuffer) {
    this.buffer = buffer;
  }

  public hasIndices(): boolean {
    return Boolean(this.indices);
  }

  public setIndicesBuffer(buffer: WebGLBuffer) {
    this.indicesBuffer = buffer;
  }

  public setLocation(location: number) {
    this.location = location;
  }
}

interface VectorShaderAttributeOptions extends ShaderAttributeOptions {
  data?: number[];
}

export class Vector2Attribute extends ShaderAttribute {
  protected data: number[] | Float32Array;

  constructor(
    protected readonly locationName: string,
    opts: VectorShaderAttributeOptions = {},
  ) {
    super(locationName, opts);
    if (opts.data && opts.data.length !== 2) {
      throw new Error('Mismatched dimension for vector attribute');
    }
  }
}

export class Vector3Attribute extends ShaderAttribute {
  protected data: number[] | Float32Array;

  constructor(
    protected readonly locationName: string,
    opts: VectorShaderAttributeOptions = {},
  ) {
    super(locationName, opts);
    if (opts.data && opts.data.length !== 3) {
      throw new Error('Mismatched dimension for vector attribute');
    }
  }
}

export class Vector4Attribute extends ShaderAttribute {
  protected data: number[] | Float32Array;

  constructor(
    protected readonly locationName: string,
    opts: VectorShaderAttributeOptions = {},
  ) {
    super(locationName, opts);
    if (opts.data && opts.data.length !== 4) {
      throw new Error('Mismatched dimension for vector attribute');
    }
  }
}
