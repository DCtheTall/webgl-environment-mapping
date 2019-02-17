export interface ShaderDataOptions {
  data?: number | number[] | Float32Array;
}

export default class ShaderData {
  protected data: number | number[] | Float32Array;

  constructor(
    protected readonly locationName: string,
    {data}: ShaderDataOptions = {},
  ) {
    this.data = data;
  }

  public getLocationName(): string {
    return this.locationName;
  }

  getData() {
    return this.data;
  }

  setData(data: number | number[] | Float32Array) {
    this.data = data;
  }
}
