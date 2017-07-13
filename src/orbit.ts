import Cube from './Cube';
import {
  vec3,
  vec4,
  mat4,
} from 'gl-matrix';

function rotateVector(rad: number, axis: vec3, threeVec: vec3): vec3 {
  let rotationMat: mat4;
  let fourVec: vec4;
  rotationMat = mat4.fromRotation(mat4.create(), rad, axis);
  fourVec = vec4.fromValues(threeVec[0], threeVec[1], threeVec[2], 1);
  fourVec = vec4.transformMat4(vec4.create(), fourVec, rotationMat);
  return vec3.fromValues(fourVec[0], fourVec[1], fourVec[2]);
}

function initCubeOrbits(cubes: Cube[]): () => void {
  let radialVectors: vec3[];
  let tangentialVectors: vec3[];
  let orbitAxialVectors: vec3[];
  let rotationAxialVectors: vec3[];
  let dThetas: number[];
  let t: number;

  radialVectors = [
    vec3.fromValues(-8, 0, 0),
    vec3.fromValues(8, 0, 0),
    vec3.fromValues(0, 0, 8),
    vec3.fromValues(0, 0, -8),
    vec3.fromValues(0, 8, 0),
    vec3.fromValues(0, -8, 0),
  ];
  tangentialVectors = radialVectors.map((v: vec3): vec3 => {
    let radialVec: vec3;
    let randomVec: vec3;
    let projectedVec: vec3;
    radialVec = vec3.normalize(vec3.create(), v);
    randomVec = vec3.normalize(vec3.create(), vec3.fromValues(Math.random(), Math.random(), Math.random()));
    projectedVec = vec3.scale(vec3.create(), randomVec, vec3.dot(radialVec, randomVec));
    return vec3.normalize(projectedVec, projectedVec);
  });
  orbitAxialVectors = radialVectors.map((v: vec3, i: number): vec3 => {
    let radialVec: vec3;
    let tangentialVec: vec3;
    let axialVec: vec3;
    radialVec = vec3.normalize(vec3.create(), v);
    tangentialVec = tangentialVectors[i];
    axialVec = vec3.cross(vec3.create(), radialVec, tangentialVec);
    return vec3.normalize(axialVec, axialVec);
  });
  rotationAxialVectors = orbitAxialVectors.map((): vec3 => vec3.fromValues(Math.random(), Math.random(), Math.random()));
  dThetas = orbitAxialVectors.map((): number => Math.random() / 120);

  t = 0;

  return () => cubes.forEach((model: Cube, i: number) => {
    t += 1;
    let position: vec3;
    position = rotateVector(dThetas[i] * t, orbitAxialVectors[i], radialVectors[i]);
    model.setPosition(position);
    model.rotate(dThetas[i] * 5, rotationAxialVectors[i]);
  });
}

export default initCubeOrbits;
