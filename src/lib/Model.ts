import {
  vec3,
  mat4,
} from 'gl-matrix';
import axios from 'axios';
import { Mesh } from 'webgl-obj-loader';

import {
  DEFAULT_POSITION,
  DEFAULT_AMBIENT_COLOR,
  DEFAULT_TEXTURE_WEIGHT,
  WHITE,
} from './constants';


export interface ModelOptions {
  ambientMaterialColor?: vec3;
  lambertianMaterialColor?: vec3;
  specularMaterialColor?: vec3;
  textureWeight?: number;
}


export default class Model {
  private position: vec3;
  private scaleMatrix: mat4;
  private rotationMatrix: mat4;

  protected _indices: Uint16Array;
  protected _normals: Float32Array;
  protected _texUVs: Float32Array;
  protected _vertices: Float32Array;

  public readonly ambientMaterialColor: vec3;
  public readonly lambertianMaterialColor: vec3;
  public readonly specularMaterialColor: vec3;
  public readonly textureWeight: number;

  constructor(opts?: ModelOptions) {
    this.position = DEFAULT_POSITION;
    this.scaleMatrix = mat4.create();
    this.rotationMatrix = mat4.create();
    this.ambientMaterialColor =
      (opts && opts.ambientMaterialColor) || DEFAULT_AMBIENT_COLOR;
    this.lambertianMaterialColor =
      (opts && opts.lambertianMaterialColor) || WHITE;
    this.specularMaterialColor =
      (opts && opts.specularMaterialColor) || WHITE;
    this.textureWeight =
      (opts && opts.textureWeight) || DEFAULT_TEXTURE_WEIGHT;
  }

  get indices(): Uint16Array {
    return this._indices;
  }

  get modelMat(): mat4 {
    return mat4.multiply(
      mat4.create(),
      this.translationMatrix,
      mat4.multiply(
        mat4.create(), this.rotationMatrix, this.scaleMatrix),
    );
  }

  get normalMat(): mat4 {
    return mat4.transpose(
      mat4.create(),
      mat4.invert(mat4.create(), this.modelMat));
  }

  get normals(): Float32Array {
    return this._normals;
  }

  get texUVs(): Float32Array {
    return this._texUVs;
  }

  get translationMatrix(): mat4 {
    return mat4.fromValues(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      this.position[0], this.position[1], this.position[2], 1
    );
  }

  get vertices(): Float32Array {
    return this._vertices;
  }

  public async loadObjFile(url: string) {
    try {
      const { data } = await axios.get(url);
      const mesh = new Mesh(data);
      const maxTextureVal = Math.max.apply(null, ...mesh.textures, 1);

      this._vertices = new Float32Array(mesh.vertices);
      this._normals = new Float32Array(mesh.vertexNormals);
      this._texUVs = new Float32Array(mesh.textures.map((val: number) => val / maxTextureVal));
      this._indices = new Uint16Array(mesh.indices);
    } catch (err) {
      console.error(err);
    }
  }

  public rotate(rad: number, axis: vec3) {
    this.rotationMatrix =
      mat4.multiply(
        mat4.create(),
        mat4.fromRotation(mat4.create(), rad, axis),
        this.rotationMatrix,
      );
  }

  public scale(s: number) {
    this.scaleMatrix = mat4.fromValues(
      s, 0, 0, 0,
      0, s, 0, 0,
      0, 0, s, 0,
      0, 0, 0, 1,
    );
  }

  public setPosition(x: number | vec3, y?: number, z?: number) {
    if (typeof x === 'number') {
      this.position = vec3.add(vec3.create(), vec3.fromValues(x, y, z), this.position);
    } else {
      this.position = x;
    }
  }

  public reset() {
    this.rotationMatrix = mat4.create();
    this.rotate(-Math.PI / 2, vec3.fromValues(1, 0, 0));
  }
}
