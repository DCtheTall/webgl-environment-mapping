import { vec3 } from 'gl-matrix';


export const CLEAR_COLOR = [0, 0, 0, 1];
export const FRAME_RATE = 60;

export const DEFAULT_POSITION = vec3.fromValues(0, 0, 0);
export const DEFAULT_AMBIENT_COLOR = vec3.fromValues(0.3, 0.3, 0.3);
export const DEFAULT_TEXTURE_WEIGHT = 1;
export const WHITE = vec3.fromValues(1, 1, 1);

export const DEFAULT_ASPECT_RATIO = 1;
export const DEFAULT_FOV = Math.PI / 3;

export const DEFAULT_NEAR_PLANE = 1;
export const DEFAULT_FAR_PLANE = 1e6;

export const DEFAULT_AT = vec3.fromValues(0, 0, 6);
export const DEFAULT_EYE = vec3.fromValues(0, 0, 0);
export const DEFAULT_UP = vec3.fromValues(0, 1, 0);


export const SKYBOX_FRAGMENT_SHADER =
  <string>require('../shaders/skybox-fragment.glsl');

export const SKYBOX_VERTEX_SHADER =
  <string>require('../shaders/skybox-vertex.glsl');
