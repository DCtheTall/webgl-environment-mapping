import ShaderData, { ShaderDataOptions } from './ShaderData';

export class ShaderUniform extends ShaderData {
  protected location: WebGLUniformLocation;

  constructor(
    protected readonly locationName: string,
    opts: ShaderDataOptions = {},
  ) {
    super(locationName, opts);
  }

  public setLocation(location: WebGLUniformLocation) {
    this.location = location;
  }

  public getLocation(): WebGLUniformLocation {
    return this.location;
  }
}

interface BooleanUniformOptions extends ShaderDataOptions {
  data?: 0 | 1;
}

export class BooleanUniform extends ShaderUniform {
  protected data: number;

  constructor(
    protected readonly locationName: string,
    opts: BooleanUniformOptions = {},
  ) {
    super(locationName, opts);
  }
}

interface FloatUniformOptions extends ShaderDataOptions {
  data?: number;
}

export class FloatUniform extends ShaderUniform {
  protected data: number;

  constructor(
    protected readonly locationName: string,
    opts: FloatUniformOptions = {},
  ) {
    super(locationName, opts);
  }
}

interface IntegerUniformOptions extends ShaderDataOptions {
  data?: number;
}

export class IntegerUniform extends ShaderUniform {
  protected data: number;

  constructor(
    protected readonly locationName: string,
    opts: IntegerUniformOptions = {},
  ) {
    super(locationName, opts);
  }
}

interface MatrixUniformOptions extends ShaderDataOptions {
  data?: number[];
}

export class Matrix4Uniform extends ShaderUniform {
  constructor(
    protected readonly locationName: string,
    opts: MatrixUniformOptions = {},
  ) {
    super(locationName, opts);
    if (opts.data && opts.data.length !== 16) {
      throw new Error('Dimension mismatch with matrix4 uniform');
    }
  }
}

interface VectorUniform extends ShaderDataOptions {
  data?: number[];
}

export class Vector2Uniform extends ShaderUniform {
  constructor(
    protected readonly locationName: string,
    opts: VectorUniform = {},
  ) {
    super(locationName, opts);
    if (opts.data && opts.data.length !== 2) {
      throw new Error('Dimension mismatch with matrix4 uniform');
    }
  }
}

export class Vector3Uniform extends ShaderUniform {
  constructor(
    protected readonly locationName: string,
    opts: VectorUniform = {},
  ) {
    super(locationName, opts);
    if (opts.data && opts.data.length !== 3) {
      throw new Error('Dimension mismatch with matrix4 uniform');
    }
  }
}

export class Vector4Uniform extends ShaderUniform {
  constructor(
    protected readonly locationName: string,
    opts: VectorUniform = {},
  ) {
    super(locationName, opts);
    if (opts.data && opts.data.length !== 4) {
      throw new Error('Dimension mismatch with matrix4 uniform');
    }
  }
}
