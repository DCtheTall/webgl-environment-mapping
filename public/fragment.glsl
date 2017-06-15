precision mediump float;

varying vec3 v_Normal;

void main() {
  vec3 lightDir;
  float lambertian;

  lightDir = vec3(0.0, 1.0, 0.0);
  lambertian = clamp(dot(v_Normal, lightDir), 0.0, 1.0);

  gl_FragColor = lambertian * vec4(1.0, 0.0, 0.0, 1.0);
}
