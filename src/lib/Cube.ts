export const CUBE_INDICES = new Uint16Array([
  0, 2, 1, // z+ face
  0, 3, 2,
  4, 6, 5, // z- face
  4, 7, 6,
  8, 9, 10, // x- face
  10, 11, 8,
  12, 15, 14, // x+ face
  14, 13, 12,
  16, 17, 18, // y+ face
  18, 19, 16,
  20, 23, 22, // y- face
  22, 21, 20,
]);

export const CUBE_NORMALS = new Float32Array([
  0, 0, 1, // z+
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,
  0, 0, -1, // z- face
  0, 0, -1,
  0, 0, -1,
  0, 0, -1,
  -1, 0, 0, // x- face
  -1, 0, 0,
  -1, 0, 0,
  -1, 0, 0,
  1, 0, 0, // x+ face
  1, 0, 0,
  1, 0, 0,
  1, 0, 0,
  0, 1, 0, // y+ face
  0, 1, 0,
  0, 1, 0,
  0, 1, 0,
  0, -1, 0, // y- face
  0, -1, 0,
  0, -1, 0,
  0, -1, 0,
]);


export const CUBE_VERTICES = new Float32Array([
  -1, 1, 1,  // z+ face
  1, 1, 1,
  1, -1, 1,
  -1, -1, 1,
  -1, 1, -1, // z- face
  1, 1, -1,
  1, -1, -1,
  -1, -1, -1,
  -1, 1, 1, // x- face
  -1, 1, -1,
  -1, -1, -1,
  -1, -1, 1,
  1, 1, 1, // x+ face
  1, 1, -1,
  1, -1, -1,
  1, -1, 1,
  -1, 1, 1, // y+ face
  1, 1, 1,
  1, 1, -1,
  -1, 1, -1,
  -1, -1, 1, // y- face
  1, -1, 1,
  1, -1, -1,
  -1, -1, -1,
]);


export interface CubeFaces<T> {
  'x+': T; 'x-': T;
  'y+': T; 'y-': T;
  'z+': T; 'z-': T;
}
