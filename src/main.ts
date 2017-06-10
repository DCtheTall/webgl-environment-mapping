import Scene from './Scene';

const canvas = <HTMLCanvasElement>document.getElementById('webgl-canvas');

const scene = new Scene(canvas);
console.log(scene.camera);
