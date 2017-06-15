precision mediump float;

uniform float u_Ambient;
uniform float u_Lambertian;

varying vec3 v_Normal;

void main() {
  vec3 lightDir;
  float lambertian;

  lightDir = vec3(0.0, 1.0, 0.0);
  lambertian = clamp(dot(v_Normal, lightDir), 0.0, 1.0);

  gl_FragColor = (u_Lambertian * lambertian + u_Ambient) * vec4(0.8, 1.0, 1.0, 1.0);
}
