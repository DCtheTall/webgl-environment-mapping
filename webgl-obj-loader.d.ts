export = OBJ;

declare namespace OBJ {
  class Mesh {
    constructor(objFile: string);
    vertices: number[];
    vertexNormals: number[];
    indices: number[];
  }
}
