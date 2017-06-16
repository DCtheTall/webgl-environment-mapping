import axios, { AxiosResponse } from 'axios';
import * as BluebirdPromise from 'bluebird';
import {
  vec3,
  mat4,
} from 'gl-matrix';
import * as OBJ from 'webgl-obj-loader';

export default class Model {
  private position: vec3;

  private rotationMatrix: mat4;
  private translationMatrix: mat4;

  public vertices: Float32Array;
  public normals: Float32Array;
  public indices: Uint16Array;

  public ambient: number;
  public lambertian: number;
  public specular: number;

  constructor() {
    this.position = vec3.fromValues(0, 0, 0);
    this.rotationMatrix = mat4.create();
    this.translationMatrix = mat4.create();

    this.ambient = 0.2;
    this.lambertian = 0.8;
    this.specular = 300;
  }

  public loadOBJFile(url: string): Promise<void> {
    return axios
      .get(url)
      .then((res: AxiosResponse) => {
        let model: OBJ.Mesh;

        model = new OBJ.Mesh(res.data);
        this.vertices = new Float32Array(model.vertices);
        this.normals = new Float32Array(model.vertexNormals);
        this.indices = new Uint16Array(model.indices);
        console.log(Math.max.apply(null, this.vertices));

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
    this.rotationMatrix = mat4.multiply(mat4.create(), mat4.fromRotation(mat4.create(), rad, axis), this.rotationMatrix);
  }

  public modelMat(): mat4 {
    return mat4.multiply(mat4.create(), this.translationMatrix, this.rotationMatrix);
  }

  public normalMat(): mat4 {
    let invertedModelMat: mat4;

    invertedModelMat = mat4.invert(mat4.create(), this.modelMat());
    return mat4.transpose(mat4.create(), invertedModelMat);
  }
}
