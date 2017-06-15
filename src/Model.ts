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

  private rotationMatrix: mat4;
  private translationMatrix: mat4;

  constructor() {
    this.position = vec3.fromValues(0, 0, 0);
    this.rotationMatrix = mat4.create();
    this.translationMatrix = mat4.create();
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

  public translate(_dx: number | vec3, dy: number, dz: number): void {
    if (typeof _dx === 'number') {
      let dx: number;

      dx = <number>_dx;
      this.position = vec3.add(vec3.create(), vec3.fromValues(dx, dy, dz), this.position);
    } else {
      this.position = vec3.add(vec3.create(), _dx, this.position);
    }
  }

  public rotate(rad: number, axis: vec3): void {
    this.rotationMatrix = mat4.fromRotation(this.rotationMatrix, rad, axis);
  }

  public modelMat(): mat4 {
    return mat4.multiply(mat4.create(), this.translationMatrix, this.rotationMatrix);
  }

  public normalMatrix(): mat4 {
    let invertedModelMat: mat4;

    invertedModelMat = mat4.invert(mat4.create(), this.modelMat());
    return mat4.transpose(mat4.create(), invertedModelMat);
  }
}
