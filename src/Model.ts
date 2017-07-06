import axios, { AxiosResponse } from 'axios';
import * as BluebirdPromise from 'bluebird';
import {
  vec3,
  mat4,
} from 'gl-matrix';
import CubeFaces from './CubeFaces';
import CubeCamera from './CubeCamera';
import * as OBJ from 'webgl-obj-loader';

export interface ModelOptions {
  useLighting?: boolean;
  ambientMaterialColor?: vec3;
  lambertianMaterialColor?: vec3;
  specularMaterialColor?: vec3;
}

export default class Model {
  private position: vec3;

  private scaleMatrix: mat4;
  private rotationMatrix: mat4;

  public useTexture: boolean;
  public useLighting: boolean;

  public vertices: Float32Array;
  public normals: Float32Array;
  public textureUVs: Float32Array;
  public texDirections: Float32Array;
  public indices: Uint16Array;

  public ambientMaterialColor: vec3;
  public lambertianMaterialColor: vec3;
  public specularMaterialColor: vec3;

  public cubeCamera: CubeCamera;
  public cubeTexture: CubeFaces<any>;

  constructor(opts?: ModelOptions) {
    this.useTexture = false;
    this.useLighting = opts !== undefined && opts.useLighting ? opts.useLighting : true;

    this.position = vec3.fromValues(0, 0, 0);
    this.scaleMatrix = mat4.create();
    this.rotationMatrix = mat4.create();

    this.ambientMaterialColor = opts && opts.ambientMaterialColor ? opts.ambientMaterialColor : vec3.fromValues(0, 0, 0);
    this.lambertianMaterialColor = opts && opts.lambertianMaterialColor ? opts.lambertianMaterialColor : vec3.fromValues(1, 1, 1);
    this.specularMaterialColor = opts && opts.specularMaterialColor ? opts.specularMaterialColor : vec3.fromValues(1, 1, 1);
  }

  public addCubeCamera(): void {
    this.cubeCamera = new CubeCamera();
  }

  public loadOBJFile(url: string): Promise<void> {
    return axios
      .get(url)
      .then((res: AxiosResponse) => {
        let model: OBJ.Mesh;
        let maxTextureVal: number;

        model = new OBJ.Mesh(res.data);
        maxTextureVal = Math.max.apply(null, [...model.textures, 1]);

        this.vertices = new Float32Array(model.vertices);
        this.normals = new Float32Array(model.vertexNormals);
        this.textureUVs = new Float32Array(model.textures.map((val: number) => val / maxTextureVal));
        this.indices = new Uint16Array(model.indices);

        return BluebirdPromise.resolve();
      })
      .catch(console.error);
  }

  public loadCubeTexture(cubeTextureUrls: CubeFaces<string>): Promise<void> {
    this.useTexture = true;
    return BluebirdPromise.all(
      Object.keys(this.cubeTexture).map((key: string) => new BluebirdPromise((resolve: () => {}) => {
        this.cubeTexture[key] = new Image();
        this.cubeTexture[key].src = cubeTextureUrls[key];
        this.cubeTexture[key].onload = resolve;
      }))
    );
  }

  public scale(s: number) {
    this.scaleMatrix = mat4.fromValues(
      s, 0, 0, 0,
      0, s, 0, 0,
      0, 0, s, 0,
      0, 0, 0, 1
    );
  }

  public translate(dx: number|vec3, dy?: number, dz?: number): void {
    if (typeof dx === 'number') {
      this.position = vec3.add(vec3.create(), vec3.fromValues(dx, dy, dz), this.position);
      if (this.cubeCamera) this.cubeCamera.translate(dx, dy, dz);
    } else {
      this.position = vec3.add(vec3.create(), dx, this.position);
      if (this.cubeCamera) this.cubeCamera.translate(dx);
    }
  }

  public rotate(rad: number, axis: vec3): void {
    this.rotationMatrix = mat4.multiply(mat4.create(), mat4.fromRotation(mat4.create(), rad, axis), this.rotationMatrix);
    if (this.cubeCamera) this.cubeCamera.rotate(rad, axis);
  }

  private translationMatrix(): mat4 {
    return mat4.fromValues(
      1, 0, 0, this.position[0],
      0, 1, 0, this.position[1],
      0, 0, 1, this.position[2],
      0, 0, 0, 1
    );
  }

  public modelMat(): mat4 {
    let rotateScaleMatrix: mat4 = mat4.multiply(mat4.create(), this.rotationMatrix, this.scaleMatrix);
    return mat4.multiply(mat4.create(), this.translationMatrix(), rotateScaleMatrix);
  }

  public normalMat(): mat4 {
    let invertedModelMat: mat4;
    invertedModelMat = mat4.invert(mat4.create(), this.modelMat());
    return mat4.transpose(mat4.create(), invertedModelMat);
  }
}
