precision highp float;

uniform vec3 u_AmbientMaterialColor;
uniform vec3 u_CameraEye;
uniform vec3 u_LambertianMaterialColor;
uniform vec3 u_SpecularMaterialColor;

uniform float u_TextureWeight;
uniform samplerCube u_SamplerCube;

varying vec3 v_Position;
varying vec3 v_Normal;


const vec3 AMBIENT_LIGHT_COLOR = vec3(0.7, 0.8, 1.);
const vec3 LIGHT_POSITION = vec3(-25., 100., 30.);
const vec3 LAMBERTIAN_LIGHT_COLOR = vec3(1., 0.9, 0.8);
const vec3 SPECULAR_LIGHT_COLOR = vec3(1., 1., 1.);


void main() {
  vec3 lightDir = normalize(LIGHT_POSITION - v_Position);
  float lambertian = clamp(dot(v_Normal, lightDir), 0., 1.);
  vec3 viewDir = normalize(u_CameraEye - v_Position);
  vec3 halfVec = normalize(lightDir + viewDir);
  float blinnPhong = pow(dot(halfVec, normalize(v_Normal)), 300.);
  vec3 texDirection = -reflect(viewDir, v_Normal);
  vec3 color = u_AmbientMaterialColor * AMBIENT_LIGHT_COLOR;

  color += lambertian * u_LambertianMaterialColor * LAMBERTIAN_LIGHT_COLOR;
  color *= 1. - u_TextureWeight;
  color += (.25 + (.75 * lambertian)) * u_TextureWeight * textureCube(u_SamplerCube, texDirection).xyz;
  color += blinnPhong * u_SpecularMaterialColor * SPECULAR_LIGHT_COLOR;

  gl_FragColor = vec4(color, 1.);
}
