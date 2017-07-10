precision mediump float;

attribute vec3 a_Position;

uniform mat4 u_ModelMat;
uniform mat4 u_PerspectiveMat;
uniform mat4 u_ViewMat;

varying vec3 v_TexDirection;

void main() {
  v_TexDirection = a_Position;
  gl_Position = u_PerspectiveMat * u_ViewMat * u_ModelMat * vec4(a_Position, 1.0);
}
