export interface ShaderDataOptions {
  data?: number | number[] | Float32Array;
  buffer?: WebGLBuffer;
}

export default class ShaderData {
  protected data: number | number[] | Float32Array;
  protected buffer: WebGLBuffer;

  constructor(
    protected readonly locationName: string,
    {data, buffer}: ShaderDataOptions = {},
  ) {
    this.data = data;
    this.buffer = buffer;
  }

  getData() {
    return this.data;
  }

  setData(data: number | number[] | Float32Array) {
    this.data = data;
  }
}
