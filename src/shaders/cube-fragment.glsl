precision lowp float;

uniform vec3 u_AmbientMaterialColor;
uniform vec3 u_LambertianMaterialColor;
uniform vec3 u_SpecularMaterialColor;
uniform vec3 u_CameraEye;

varying vec3 v_Position;
varying vec3 v_Normal;


const vec3 AMBIENT_LIGHT_COLOR = vec3(0.7, 0.8, 1.0);
const vec3 LIGHT_POSITION = vec3(-25, 100, 30);
const vec3 LAMBERTIAN_LIGHT_COLOR = vec3(1.0, 0.9, 0.8);
const vec3 SPECULAR_LIGHT_COLOR = vec3(1.0, 1.0, 1.0);


void main() {
  vec3 lightDir = normalize(LIGHT_POSITION - v_Position);
  float lambertian = clamp(dot(v_Normal, lightDir), 0.0, 1.0);

  vec3 viewDir = normalize(u_CameraEye - v_Position);
  vec3 halfVec = normalize(lightDir + viewDir);
  float blinnPhong = pow(dot(halfVec, normalize(v_Normal)), 300.0);

  vec3 color = u_AmbientMaterialColor * AMBIENT_LIGHT_COLOR;

  color += lambertian * u_LambertianMaterialColor * LAMBERTIAN_LIGHT_COLOR;
  color += blinnPhong * u_SpecularMaterialColor * SPECULAR_LIGHT_COLOR;

  gl_FragColor = vec4(color, 1.0);
}
