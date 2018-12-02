precision highp float;

uniform vec3 u_AmbientMaterialColor;
uniform vec3 u_LambertianMaterialColor;
uniform vec3 u_SpecularMaterialColor;

uniform vec3 u_CameraEye;

uniform float u_TextureWeight;

uniform samplerCube u_Sampler;

varying vec3 v_Position;
varying vec3 v_Normal;

void main() {
  vec3 ambientLightColor;
  vec3 lightPosition;
  vec3 lambertianLightColor;
  vec3 specularLightColor;
  vec3 color;
  vec3 lightDir;
  float lambertian;
  vec3 viewDir;
  vec3 texDirection;
  vec3 halfVec;
  float blinnPhong;

  ambientLightColor = vec3(0.7, 0.8, 1.0);
  lightPosition = vec3(-25, 100, 30);
  lambertianLightColor = vec3(1.0, 0.9, 0.8);
  specularLightColor = vec3(1.0, 1.0, 1.0);

  color = u_AmbientMaterialColor * ambientLightColor;

  lightDir = normalize(lightPosition - v_Position);
  lambertian = clamp(dot(v_Normal, lightDir), 0.0, 1.0);
  color += lambertian * u_LambertianMaterialColor * lambertianLightColor;

  viewDir = normalize(u_CameraEye - v_Position);
  texDirection = -reflect(viewDir, v_Normal);
  color = (u_TextureWeight * vec3(textureCube(u_Sampler, texDirection).xyz)) + ((1.0 - u_TextureWeight) * color);

  halfVec = normalize(lightDir + viewDir);
  blinnPhong = pow(dot(halfVec, normalize(v_Normal)), 300.0);
  color += blinnPhong * u_SpecularMaterialColor * specularLightColor;

  gl_FragColor = vec4(color, 1.0);
}
