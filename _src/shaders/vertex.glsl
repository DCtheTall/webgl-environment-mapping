precision mediump float;


attribute vec3 a_Position;
attribute vec3 a_Normal;

uniform mat4 u_ModelMat;
uniform mat4 u_NormalMat;
uniform mat4 u_PerspectiveMat;
uniform mat4 u_ViewMat;

varying vec3 v_Position;
varying vec3 v_Normal;


void main() {
  vec4 transformedPosition = u_ModelMat * vec4(a_Position, 1.);
  v_Position = vec3(transformedPosition.xyz);

  vec4 transformedNormal = u_NormalMat * vec4(a_Normal, 1.);
  v_Normal = normalize(vec3(transformedNormal.xyz));

  gl_Position = u_PerspectiveMat * u_ViewMat * transformedPosition;
}
