import { vec3 } from 'gl-matrix';
import Scene from './Scene';
import Model from './Model';
import Cube from './Cube';

const canvas = <HTMLCanvasElement>document.getElementById('webgl-canvas');

const scene = new Scene(canvas);

// const teapot = new Model({
//   ambientMaterialColor: vec3.fromValues(0.3, 0.3, 0.3),
// });

const skyBox = new Cube({
  useLighting: false,
  ambientMaterialColor: vec3.fromValues(0.5, 0.5, 0.5),
});

scene.initShaderProgram()
  // .then(() => teapot.loadOBJFile('/teapot.obj'))
  .then(() => skyBox.loadCubeTexture({
    top: '/sky-box/top.png',
    bottom: '/sky-box/bottom.png',
    left: '/sky-box/left.png',
    right: '/sky-box/right.png',
    front: '/sky-box/front.png',
    back: '/sky-box/back.png',
  }))
  // .then(() => skyBox.loadImageForTexture('/red.png'))
  .then(() => {
    skyBox.rotate(-Math.PI / 96, vec3.fromValues(0, 1, 0));
    skyBox.scale(20);
    scene.renderSkyBox(skyBox);
  })
  .catch(console.error);
