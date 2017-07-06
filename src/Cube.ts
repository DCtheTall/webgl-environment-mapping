import Model, { ModelOptions } from './Model';
import * as BluebirdPromise from 'bluebird';
import axios from 'axios';

export default class Cube extends Model {
  constructor(opts?: ModelOptions) {
    super(opts);
    this.cubeTexture = {
      top: null,
      bottom: null,
      left: null,
      right: null,
      front: null,
      back: null,
    };

    this.vertices = new Float32Array([
      -1, 1, 1,  // front face
      1, 1, 1,
      1, -1, 1,
      -1, -1, 1,
      -1, 1, -1, // back face
      1, 1, -1,
      1, -1, -1,
      -1, -1, -1,
      -1, 1, 1, // left face
      -1, 1, -1,
      -1, -1, -1,
      -1, -1, 1,
      1, 1, 1, // right face
      1, 1, -1,
      1, -1, -1,
      1, -1, 1,
      -1, 1, 1, // top face
      1, 1, 1,
      1, 1, -1,
      -1, 1, -1,
      -1, -1, 1, // bottom face
      1, -1, 1,
      1, -1, -1,
      -1, -1, -1,
    ]);
    this.normals = new Float32Array([
      0, 0, 1, // front face
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, -1, // back face
      0, 0, -1,
      0, 0, -1,
      0, 0, -1,
      -1, 0, 0, // left face
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,
      1, 0, 0, // right face
      1, 0, 0,
      1, 0, 0,
      1, 0, 0,
      0, 1, 0, // top face
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, -1, 0, // bottom face
      0, -1, 0,
      0, -1, 0,
      0, -1, 0,
    ]);
    this.indices = new Uint16Array([
      0, 2, 1, // front face
      0, 3, 2,
      4, 6, 5, // back face
      4, 7, 6,
      8, 9, 10, // left face
      10, 11, 8,
      12, 15, 14, // right face
      14, 13, 12,
      16, 17, 18, // top face
      18, 19, 16,
      20, 23, 22, // bottom face
      22, 21, 20,
    ]);
  }
}
