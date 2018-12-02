precision mediump float;

uniform samplerCube u_Sampler;

varying vec3 v_TexDirection;

void main() {
  gl_FragColor = textureCube(u_Sampler, v_TexDirection);
}
