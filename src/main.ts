import Scene from './Scene';
import Model from './Model';

const canvas = <HTMLCanvasElement>document.getElementById('webgl-canvas');

const scene = new Scene(canvas);

const teapot = new Model();

scene.initEnvironmentShaders()
  .then(() => teapot.loadOBJFile('/teapot.obj'))
  .then(() => {
    scene.renderEnvironment(teapot);
  });
