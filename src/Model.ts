import * as ParseWavefrontObj from 'wavefront-obj-parser';
import axios, { AxiosResponse } from 'axios';
import * as BluebirdPromise from 'bluebird';
import {
  vec3,
  mat4,
} from 'gl-matrix';

export default class Model {
  public vertices: Float32Array;
  public normals: Float32Array;
  public UVs: Float32Array;
  public normalIndices: Uint16Array;
  public vertexIndices: Uint16Array;
  public UVIndices: Uint16Array;

  private position: vec3;
  private polarAngle: number;

  public modelMat: mat4;

  constructor() {
    this.position = vec3.fromValues(0, 0, 0);
    this.polarAngle = 0;
    this.modelMat = mat4.create();
  }

  public loadOBJFile(url: string): Promise<void> {
    return axios
      .get(url)
      .then((res: AxiosResponse) => {
        let objJson: ParseWavefrontObj.ResultJSON;

        objJson = ParseWavefrontObj(res.data);

        this.vertices = new Float32Array(objJson.vertex);
        this.normals = new Float32Array(objJson.normal);
        this.UVs = new Float32Array(objJson.uv);
        this.vertexIndices = new Uint16Array(objJson.vertexIndex.filter((i: number) => i >= 0));
        this.normalIndices = new Uint16Array(objJson.normalIndex);
        this.UVIndices = new Uint16Array(objJson.uvIndex);

        return BluebirdPromise.resolve();
      })
      .catch(console.error);
  }
}
