precision mediump float;

uniform samplerCube u_Sampler;

varying vec3 v_Position;
varying vec3 v_Normal;
varying vec3 v_TexDirection;

void main() {
  gl_FragColor = vec4(textureCube(u_Sampler, v_Position));
}
