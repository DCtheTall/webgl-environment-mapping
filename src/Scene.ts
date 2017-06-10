import axios, { AxiosResponse } from 'axios';

interface viewport {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

class Scene {
  private ASPECT_RATIO: number = 1;
  private gl: WebGLRenderingContext;
  private viewports: viewport[];

  constructor(canvas: HTMLCanvasElement) {
    this.gl = <WebGLRenderingContext>(canvas.getContext('web-gl') || canvas.getContext('experimental-web-gl'));
  }
}

export default Scene;
