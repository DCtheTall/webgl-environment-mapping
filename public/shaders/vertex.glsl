precision mediump float;

attribute vec3 a_Position;
attribute vec3 a_Normal;
attribute vec2 a_TexCoord;

uniform mat4 modelMat;
uniform mat4 normalMat;
uniform mat4 perspectiveMat;
uniform mat4 viewMat;

varying vec3 v_Position;
varying vec3 v_Normal;
varying vec2 v_TexCoord;

void main() {
  vec4 transformedPosition;
  vec4 transformedNormal;

  transformedPosition = modelMat * vec4(a_Position, 1.0);
  v_Position = vec3(transformedPosition.xyz);

  transformedNormal = normalMat * vec4(a_Normal, 1.0);
  v_Normal = vec3(transformedNormal.xyz);

  v_TexCoord = a_TexCoord;

  gl_Position = perspectiveMat * viewMat * transformedPosition;
}
