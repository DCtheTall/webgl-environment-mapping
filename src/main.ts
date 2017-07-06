import { vec3 } from 'gl-matrix';
import Scene from './Scene';
import Model from './Model';
import Cube from './Cube';
import Camera from './Camera';

const canvas = <HTMLCanvasElement>document.getElementById('webgl-canvas');

let sideLength: number;
sideLength = window.innerWidth >= 500 ? 500 : 250;
canvas.width = sideLength;
canvas.height = sideLength;

const scene = new Scene(canvas);
const skyBox = new Cube({
  useLighting: false,
  ambientMaterialColor: vec3.fromValues(0.5, 0.5, 0.5),
});
const reflectiveCube = new Cube();
const camera = new Camera();

reflectiveCube.addCubeCamera();

scene.addCamera(camera);
scene
  .initShaderProgram()
  .then(() => skyBox.loadCubeTexture({
    top: '/sky-box/top.png',
    bottom: '/sky-box/bottom.png',
    left: '/sky-box/left.png',
    right: '/sky-box/right.png',
    front: '/sky-box/front.png',
    back: '/sky-box/back.png',
  }))
  .then(() => {
    skyBox.rotate(-Math.PI / 96, vec3.fromValues(0, 1, 0));
    skyBox.scale(20);
    scene.renderSkyBox(skyBox);
  })
  .catch(console.error);
