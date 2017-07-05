precision mediump float;

attribute vec3 a_Position;
attribute vec3 a_Normal;
attribute vec2 a_TexCoord;

uniform mat4 u_ModelMat;
uniform mat4 u_NormalMat;
uniform mat4 u_PerspectiveMat;
uniform mat4 u_ViewMat;

varying vec3 v_Position;
varying vec3 v_Normal;
varying vec3 v_TexDirection;

void main() {
  vec4 transformedPosition;
  vec4 transformedNormal;

  transformedPosition = u_ModelMat * vec4(a_Position, 1.0);
  v_Position = vec3(transformedPosition.xyz);

  v_TexDirection = a_Position;

  transformedNormal = u_NormalMat * vec4(a_Normal, 1.0);
  v_Normal = vec3(transformedNormal.xyz);

  gl_Position = u_PerspectiveMat * u_ViewMat * transformedPosition;
}
