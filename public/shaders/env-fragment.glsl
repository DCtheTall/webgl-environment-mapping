precision mediump float;

uniform float u_Ambient;
uniform float u_Lambertian;
uniform float u_Specular;

uniform vec3 cameraEye;
uniform vec3 cameraAt;

uniform sampler2D u_Sampler;

varying vec3 v_Normal;
varying vec2 v_TexCoord;

void main() {
  vec3 lightDir;
  float lambertian;

  vec3 viewDir;
  vec3 halfVec;
  float blinnPhong;

  vec3 lighting;
  vec3 texture_color;
  vec3 color;

  lightDir = normalize(vec3(0.1, 1.0, -0.2));
  lambertian = clamp(dot(normalize(v_Normal), lightDir), 0.0, 1.0);

  viewDir = normalize(cameraEye - cameraAt);
  halfVec = normalize(lightDir + viewDir);
  blinnPhong = pow(dot(halfVec, normalize(v_Normal)), 300.0);

  texture_color = vec3(texture2D(u_Sampler, v_TexCoord).xyz);

  lighting = u_Ambient * vec3(0.7, 0.7, 1.0);
  lighting += u_Lambertian * lambertian * vec3(1.0, 0.95, 0.8);

  color = lighting * texture_color;
  color += blinnPhong * vec3(1.0, 1.0, 1.0);

  gl_FragColor = vec4(color, 1.0);
}
