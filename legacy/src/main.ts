import { vec3 } from 'gl-matrix';
import Scene from './Scene';
import Model from './Model';
import Cube from './Cube';
import Camera from './Camera';
import {
  initOrbitControls,
  initReflectiveModelControls,
} from './controls';
import initCubeOrbits from './orbit';

const canvas = <HTMLCanvasElement>document.getElementById('webgl-canvas');
const skyBox = new Cube();
const reflectiveModel = new Model({ textureWeight: 0.7 });
const camera = new Camera();

let scene: Scene;

function isRetina(): boolean {
  return (
    (
      window.matchMedia
      && (
        window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches
        || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches
      )
    )
    || (
      window.devicePixelRatio
      && window.devicePixelRatio >= 2
    )
  ) && /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
}

function render(rotateTeapot: () => void, orbitCubes: () => void): void {
  rotateTeapot();
  orbitCubes();
  scene.render();
  window.requestAnimationFrame(render.bind(null, rotateTeapot, orbitCubes));
}

function main(): void {
  let sideLength: number;

  sideLength = window.innerWidth >= 600 ? 500 : 250;
  if (sideLength === 500 && isRetina()) sideLength *= 2;
  canvas.width = sideLength;
  canvas.height = sideLength;

  scene = new Scene(canvas);

  let cubes: Cube[] = [
    new Cube({
      ambientMaterialColor: vec3.fromValues(0.4, 0.2, 0.2),
      lambertianMaterialColor: vec3.fromValues(1, 0.3, 0.3),
    }),
    new Cube({
      ambientMaterialColor: vec3.fromValues(0.2, 0.4, 0.2),
      lambertianMaterialColor: vec3.fromValues(0.3, 1, 0.3),
    }),
    new Cube({
      ambientMaterialColor: vec3.fromValues(0.2, 0.2, 0.4),
      lambertianMaterialColor: vec3.fromValues(0.3, 0.3, 1),
    }),
    new Cube({
      ambientMaterialColor: vec3.fromValues(0.1, 0.4, 0.4),
      lambertianMaterialColor: vec3.fromValues(0.15, 1, 1),
    }),
    new Cube({
      ambientMaterialColor: vec3.fromValues(0.4, 0.1, 0.4),
      lambertianMaterialColor: vec3.fromValues(1, 0.15, 1),
    }),
    new Cube({
      ambientMaterialColor: vec3.fromValues(0.4, 0.4, 0.1),
      lambertianMaterialColor: vec3.fromValues(1, 1, 0.15),
    }),
  ];

  skyBox.scale(20);

  reflectiveModel.addCubeCamera();
  reflectiveModel.setPosition(0, -2, 0);
  reflectiveModel.rotate(-Math.PI / 2, vec3.fromValues(1, 0, 0));
  reflectiveModel.scale(0.06);

  scene.addCamera(camera);
  scene.addReflectiveModel(reflectiveModel);
  scene.addCubes(cubes);
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
      render(
        initReflectiveModelControls(reflectiveModel),
        initCubeOrbits(cubes)
      );
    })
    .catch(console.error);
}

main();
