import { vec3 } from 'gl-matrix';
import Scene from './Scene';
import Model from './Model';

const canvas = <HTMLCanvasElement>document.getElementById('webgl-canvas');

const scene = new Scene(canvas);

const teapot = new Model();

scene.initEnvironmentShaders()
  .then(() => teapot.loadOBJFile('/teapot.obj'))
  .then(() => {
    teapot.rotate(-Math.PI / 2, vec3.fromValues(1, 0, 0));
    teapot.rotate(Math.PI, vec3.fromValues(0, 1, 0));
    scene.renderEnvironment(teapot);
  });
