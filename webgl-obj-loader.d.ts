export = OBJ;

declare namespace OBJ {
  const prototype: {
    Mesh: MeshConstructor,
  };

  interface MeshConstructor {
    new (objFile: string): Mesh;
    (objFile: string): Mesh;
  }
  class Mesh {
    constructor(objFile: string);
    vertices: number[];
    vertexNormals: number[];
    indices: number[];
  }
}
