precision mediump float;

uniform bool u_UseLighting;
uniform bool u_UseTexture;

uniform vec3 u_AmbientMaterialColor;
uniform vec3 u_LambertianMaterialColor;
uniform vec3 u_SpecularMaterialColor;

uniform vec3 cameraEye;
uniform vec3 cameraAt;

uniform sampler2D u_Sampler;

varying vec3 v_Position;
varying vec3 v_Normal;
varying vec2 v_TexCoord;

void main() {
  vec3 ambientLightColor;
  vec3 lightPosition;
  vec3 lambertianLightColor;
  vec3 specularLightColor;
  vec3 color;
  vec3 lightDir;
  float lambertian;
  vec3 viewDir;
  vec3 halfVec;
  float blinnPhong;

  ambientLightColor = vec3(0.7, 0.75, 1.0);
  lightPosition = vec3(20, 100, -10);
  lambertianLightColor = vec3(0.7, 0.75, 1.0);
  specularLightColor = vec3(1.0, 1.0, 1.0);

  color = vec3(0.0, 0.0, 0.0);

  if (u_UseLighting) {
    color += u_AmbientMaterialColor * ambientLightColor;

    lightDir = normalize(lightPosition - v_Position);
    lambertian = clamp(dot(normalize(v_Normal), lightDir), 0.0, 1.0);

    color += lambertian * u_LambertianMaterialColor * lambertianLightColor;
  }

  if (u_UseTexture) {
    color *= vec3(texture2D(u_Sampler, v_TexCoord).xyz);
  }

  if (u_UseLighting) {
    viewDir = normalize(cameraEye - cameraAt);
    halfVec = normalize(lightDir + viewDir);
    blinnPhong = pow(dot(halfVec, normalize(v_Normal)), 300.0);

    color += blinnPhong * u_SpecularMaterialColor * specularLightColor;
  }

  gl_FragColor = vec4(color, 1.0);
}
