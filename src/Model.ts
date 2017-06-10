import * as ParseWavefrontObj from 'wavefront-obj-parser';
import axios, { AxiosResponse } from 'axios';
import * as BluebirdPromise from 'bluebird';
import {
  vec3,
  mat4,
} from 'gl-matrix';

export default class Model {
  public normals: number[];
  public vertices: number[];
  public UVs: number[];
  public normalIndices: number[];
  public vertexIndices: number[];
  public UVIndices: number[];

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

        this.vertices = objJson.vertex;
        this.normals = objJson.normal;
        this.UVs = objJson.uv;
        this.vertexIndices = objJson.vertexIndex;
        this.normalIndices = objJson.normalIndex;
        this.UVIndices = objJson.uvIndex;

        return BluebirdPromise.resolve();
      })
      .catch(console.error);
  }
}
