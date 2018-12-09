import Camera from './lib/Camera';
import Scene from './lib/Scene';

const canvas =
  <HTMLCanvasElement>document.getElementById('canvas');
const camera = new Camera();
const scene = new Scene(canvas);
