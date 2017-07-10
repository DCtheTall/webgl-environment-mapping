import { vec3 } from 'gl-matrix';
import Scene from './Scene';
import Model from './Model';
import Cube from './Cube';
import Camera from './Camera';
import initOrbitControls from './orbitControls';

const canvas = <HTMLCanvasElement>document.getElementById('webgl-canvas');

let sideLength: number;
sideLength = window.innerWidth >= 500 ? 500 : 250;
canvas.width = sideLength;
canvas.height = sideLength;

const skyBox = new Cube();
const reflectiveModel = new Model({
  textureWeight: 0.7,
});
const camera = new Camera();
const scene = new Scene(canvas);

function render(): void {
  reflectiveModel.rotate(Math.PI / 120, vec3.fromValues(0, 1, 0));
  scene.render();
  window.requestAnimationFrame(render);
}

skyBox.scale(20);

reflectiveModel.addCubeCamera();
reflectiveModel.translate(0, -2, 0);
reflectiveModel.rotate(-Math.PI / 3, vec3.fromValues(1, 0, 0));
reflectiveModel.scale(0.08);

scene.addCamera(camera);
scene.addReflectiveModel(reflectiveModel);
scene
  .loadShaders()
  .then(() => reflectiveModel.loadOBJFile('/teapot.obj'))
  .then(() => skyBox.loadCubeTexture({
    top: '/sky-box/top.png',
    bottom: '/sky-box/bottom.png',
    left: '/sky-box/left.png',
    right: '/sky-box/right.png',
    front: '/sky-box/front.png',
    back: '/sky-box/back.png',
  }))
  .then(() => {
    initOrbitControls(camera);
    scene.addSkyBox(skyBox); // load texture before this
    render();
  })
  .catch(console.error);
