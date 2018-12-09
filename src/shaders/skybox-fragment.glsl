precision mediump float;


uniform samplerCube u_SamplerCube;

varying vec3 v_TexDirection;


void main() {
  gl_FragColor = textureCube(u_SamplerCube, v_TexDirection);
}
