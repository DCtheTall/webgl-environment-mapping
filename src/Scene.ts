import axios, { AxiosResponse } from 'axios';
import Camera from './Camera';

interface viewport {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

class Scene {
  private _ASPECT_RATIO: number = 1;

  private gl: WebGLRenderingContext;
  private viewports: viewport[];

  public camera: Camera;

  constructor(canvas: HTMLCanvasElement) {
    this.gl = <WebGLRenderingContext>(canvas.getContext('web-gl') || canvas.getContext('experimental-web-gl'));
    this.camera = new Camera();
  }

  private loadShaders(): Promise<void> {
    return axios
      .get('/vertex.shader')
      .then((res: AxiosResponse) => {
        // TODO
      });
  }
}

export default Scene;
