precision mediump float;

attribute vec3 a_Position;

uniform mat4 modelMat;
uniform mat4 perspectiveMat;
uniform mat4 viewMat;

void main() {
  gl_Position = perspectiveMat * viewMat * modelMat * vec4(a_Position, 1.0);
}
