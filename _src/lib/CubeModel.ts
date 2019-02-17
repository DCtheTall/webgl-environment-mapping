import Model, { ModelOptions } from './Model';
import {
  CUBE_INDICES,
  CUBE_NORMALS,
  CUBE_VERTICES,
} from './Cube';


export default class CubeModel extends Model {
  constructor(opts?: ModelOptions) {
    super(opts);
    this._indices = CUBE_INDICES;
    this._normals = CUBE_NORMALS;
    this._vertices = CUBE_VERTICES;
  }
}
