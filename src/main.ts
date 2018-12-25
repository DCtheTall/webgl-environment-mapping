import {
  mat4,
  vec3,
  vec4,
} from 'gl-matrix';

import {
  CUBES_FRAGMENT_SHADER,
  SKYBOX_FRAGMENT_SHADER,
  SKYBOX_VERTEX_SHADER,
  TEAPOT_FRAGMENT_SHADER,
  VERTEX_SHADER,
} from './lib/constants';
import Camera from './lib/Camera';
import CubeCamera from './lib/CubeCamera';
import CubeModel from './lib/CubeModel';
import Frame from './lib/Frame';
import Scene from './lib/Scene';
import Shader from './lib/Shader';
import Model from './lib/Model';


function isRetina(): boolean {
  return (
    (
      window.matchMedia
      && (
        window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches
        || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches
      )
    )
    || (
      window.devicePixelRatio
      && window.devicePixelRatio >= 2
    )
  ) && /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
}


function initOrbitControls(camera: Camera) {
  let mouseDown = false;
  let mouseX: number;
  let mouseY: number;
  let polarAngle = Math.PI / 2;
  let azimuthalAngle = Math.PI / 2;

  document.addEventListener('mousedown', (event: any) => {
    mouseDown = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
  });
  document.addEventListener('mouseup', () => mouseDown = false);
  document.addEventListener('mousemove', (event: any) => {
    if (!mouseDown) return;

    polarAngle += (event.clientX - mouseX) / 100;
    azimuthalAngle -= (event.clientY - mouseY) / 100;

    camera.setEye(
      6 * Math.cos(polarAngle) * Math.sin(azimuthalAngle),
      6 * Math.cos(azimuthalAngle),
      6 * Math.sin(polarAngle) * Math.sin(azimuthalAngle),
    );

    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  document.addEventListener('keydown', (event: any) => {
    if (event.keyCode === 13) {
      polarAngle = Math.PI / 2;
      azimuthalAngle = Math.PI / 2;
      camera.setEye(
        6 * Math.cos(polarAngle) * Math.sin(azimuthalAngle),
        6 * Math.cos(azimuthalAngle),
        6 * Math.sin(polarAngle) * Math.sin(azimuthalAngle),
      );
    }
  });
}


function rotateVector(rad: number, axis: vec3, threeVec: vec3): vec3 {
  const fourVec = vec4.transformMat4(
    vec4.create(),
    vec4.fromValues(threeVec[0], threeVec[1], threeVec[2], 1),
    mat4.fromRotation(mat4.create(), rad, axis),
  );
  return vec3.fromValues(fourVec[0], fourVec[1], fourVec[2]);
}


function initCubeOrbits(cubes: CubeModel[]): () => void {
  const radialVectors = [
    vec3.fromValues(-8, 0, 0),
    vec3.fromValues(8, 0, 0),
    vec3.fromValues(0, 0, 8),
    vec3.fromValues(0, 0, -8),
    vec3.fromValues(0, 8, 0),
    vec3.fromValues(0, -8, 0),
  ];
  const tangentialVectors = radialVectors.map((v: vec3): vec3 => {
    const radialVec = vec3.normalize(vec3.create(), v);
    const randomVec = vec3.normalize(
        vec3.create(),
        vec3.fromValues(
            Math.random(), Math.random(), Math.random()));
    const projectedVec = vec3.scale(
        vec3.create(), randomVec, vec3.dot(radialVec, randomVec));
    return vec3.normalize(projectedVec, projectedVec);
  });
  const orbitAxialVectors = radialVectors.map((v: vec3, i: number): vec3 => {
    const radialVec = vec3.normalize(vec3.create(), v);
    const tangentialVec = tangentialVectors[i];
    const axialVec = vec3.cross(vec3.create(), radialVec, tangentialVec);
    return vec3.normalize(axialVec, axialVec);
  });
  const rotationAxialVectors = orbitAxialVectors.map(
      () => vec3.fromValues(
          Math.random(), Math.random(), Math.random()));
  const dThetas = orbitAxialVectors.map(() => (Math.random() / 120));

  let t = 0;

  return () => cubes.forEach((model: CubeModel, i: number) => {
    t += 1;
    let position: vec3;
    position = rotateVector(dThetas[i] * t, orbitAxialVectors[i], radialVectors[i]);
    model.setPosition(position);
    model.rotate(dThetas[i] * 5, rotationAxialVectors[i]);
  });
}


function updateFrameView(frame: Frame, camera: Camera) {
  frame.shader.setUniformData('uPerspectiveMat', camera.perspectiveMat);
  frame.shader.setUniformData('uViewMat', camera.lookAtMat);
}


function drawSkyBox(
  scene: Scene,
  camera: Camera,
  callback: (f: Frame) => void,
) {
  const skyboxFrame = scene.getFrame('skybox');
  updateFrameView(skyboxFrame, camera);
  scene.gl.activeTexture(scene.gl.TEXTURE0);
  scene.gl.bindTexture(
      scene.gl.TEXTURE_CUBE_MAP, scene.getTexture('skybox'));
  return callback(skyboxFrame);
}


function drawCubes(
  scene: Scene,
  camera: Camera,
  cubes: CubeModel[],
  callback: (f: Frame) => void,
) {
  const cubeFrame = scene.getFrame('cubes');
  updateFrameView(cubeFrame, camera);
  cubeFrame.shader.setUniformData('uCameraEye', camera.eye);
  cubes.map((cube: CubeModel) => {
    cubeFrame.shader.setAttributeData('aPosition', cube.vertices, cube.indices);
    cubeFrame.shader.setAttributeData('aNormal', cube.normals);
    cubeFrame.shader.setUniformData('uModelMat', cube.modelMat);
    cubeFrame.shader.setUniformData('uNormalMat', cube.normalMat);
    cubeFrame.shader.setUniformData(
      'uAmbientMaterialColor', cube.ambientMaterialColor);
    cubeFrame.shader.setUniformData(
      'uLambertianMaterialColor', cube.lambertianMaterialColor);
    cubeFrame.shader.setUniformData(
      'uSpecularMaterialColor', cube.specularMaterialColor);
    callback(cubeFrame);
  });
}


(async function main() {
  const canvas =
    <HTMLCanvasElement>document.getElementById('canvas');
  let sideLength = window.innerWidth >= 600 ? 500 : 250;
  if (window.innerWidth >= 600 && isRetina()) sideLength *= 2;
  canvas.width = canvas.height = sideLength;

  const camera = new Camera();
  const scene = new Scene(canvas);
  const teapot = new Model({ textureWeight: .7 });

  // teapot.setPosition(0, -2, 0);
  teapot.scale(0.06);
  teapot.rotate(-Math.PI / 2, vec3.fromValues(1, 0, 0));
  await teapot.loadObjFile('/teapot.obj');
  await scene.loadCubeTexture('skybox', {
    'x+': '/img/skybox-right.png',
    'x-': '/img/skybox-left.png',
    'y+': '/img/skybox-top.png',
    'y-': '/img/skybox-bottom.png',
    'z+': '/img/skybox-front.png',
    'z-': '/img/skybox-back.png',
  });

  const cubes = [
    new CubeModel({
      ambientMaterialColor: vec3.fromValues(0.4, 0.2, 0.2),
      lambertianMaterialColor: vec3.fromValues(1, 0.3, 0.3),
    }),
    new CubeModel({
      ambientMaterialColor: vec3.fromValues(0.2, 0.4, 0.2),
      lambertianMaterialColor: vec3.fromValues(0.3, 1, 0.3),
    }),
    new CubeModel({
      ambientMaterialColor: vec3.fromValues(0.2, 0.2, 0.4),
      lambertianMaterialColor: vec3.fromValues(0.3, 0.3, 1),
    }),
    new CubeModel({
      ambientMaterialColor: vec3.fromValues(0.1, 0.4, 0.4),
      lambertianMaterialColor: vec3.fromValues(0.15, 1, 1),
    }),
    new CubeModel({
      ambientMaterialColor: vec3.fromValues(0.4, 0.1, 0.4),
      lambertianMaterialColor: vec3.fromValues(1, 0.15, 1),
    }),
    new CubeModel({
      ambientMaterialColor: vec3.fromValues(0.4, 0.4, 0.1),
      lambertianMaterialColor: vec3.fromValues(1, 1, 0.15),
    }),
  ];
  const iterateCubeOrbits = initCubeOrbits(cubes);

  const skybox = new CubeModel();
  skybox.scale(20);

  scene.setFrame('skybox', new Frame({
    gl: scene.gl,
    width: canvas.width,
    height: canvas.height,
    nVertices: skybox.indices.length,
    drawElements: true,
    mode: scene.gl.TRIANGLES,
    shader: new Shader({
      gl: scene.gl,
      fragmentShader: SKYBOX_FRAGMENT_SHADER,
      vertexShader: SKYBOX_VERTEX_SHADER,
      attributes: {
        aPosition: {
          locationName: 'a_Position',
          type: Shader.Types.VECTOR3,
          data: skybox.vertices,
          indices: skybox.indices,
        },
      },
      uniforms: {
        uModelMat: {
          locationName: 'u_ModelMat',
          type: Shader.Types.MATRIX4,
          data: skybox.modelMat,
        },
        uPerspectiveMat: {
          locationName: 'u_PerspectiveMat',
          type: Shader.Types.MATRIX4,
        },
        uViewMat: {
          locationName: 'u_ViewMat',
          type: Shader.Types.MATRIX4,
        },
        uSamplerCube: {
          locationName: 'u_SamplerCube',
          type: Shader.Types.INTEGER,
          data: 0,
        },
      },
    }),
  }));

  scene.setFrame('cubes', new Frame({ // replace with "frame"
    gl: scene.gl, // these can be added on construction
    width: canvas.width,
    height: canvas.height,
    nVertices: cubes[0].indices.length,
    drawElements: true,
    mode: scene.gl.TRIANGLES,
    clearBeforeRender: false,
    shader: new Shader({
      gl: scene.gl,
      vertexShader: VERTEX_SHADER,
      fragmentShader: CUBES_FRAGMENT_SHADER,
      attributes: {
        aPosition: {
          locationName: 'a_Position',
          type: Shader.Types.VECTOR3,
        },
        aNormal: {
          locationName: 'a_Normal',
          type: Shader.Types.VECTOR3,
        },
      },
      uniforms: {
        uModelMat: {
          locationName: 'u_ModelMat',
          type: Shader.Types.MATRIX4, // reduce code by making replacing "type" by extending ShaderUniform to abstract types
        },
        uNormalMat: {
          locationName: 'u_NormalMat',
          type: Shader.Types.MATRIX4,
        },
        uPerspectiveMat: {
          locationName: 'u_PerspectiveMat',
          type: Shader.Types.MATRIX4,
        },
        uViewMat: {
          locationName: 'u_ViewMat',
          type: Shader.Types.MATRIX4,
        },
        uAmbientMaterialColor: {
          locationName: 'u_AmbientMaterialColor',
          type: Shader.Types.VECTOR3,
        },
        uLambertianMaterialColor: {
          locationName: 'u_LambertianMaterialColor',
          type: Shader.Types.VECTOR3,
        },
        uSpecularMaterialColor: {
          locationName: 'u_SpecularMaterialColor',
          type: Shader.Types.VECTOR3,
        },
        uCameraEye: {
          locationName: 'u_CameraEye',
          type: Shader.Types.VECTOR3,
        },
      },
    }),
  }));

  const cubeCamera = new CubeCamera(scene.gl, teapot.position);

  scene.setFrame('teapot', new Frame({
    gl: scene.gl,
    width: canvas.width,
    height: canvas.height,
    nVertices: teapot.indices.length,
    drawElements: true,
    mode: scene.gl.TRIANGLES,
    clearBeforeRender: false,
    shader: new Shader({
      gl: scene.gl,
      vertexShader: VERTEX_SHADER,
      fragmentShader: TEAPOT_FRAGMENT_SHADER,
      attributes: {
        aPosition: {
          locationName: 'a_Position',
          type: Shader.Types.VECTOR3,
          data: teapot.vertices,
          indices: teapot.indices,
        },
        aNormal: {
          locationName: 'a_Normal',
          type: Shader.Types.VECTOR3,
          data: teapot.normals,
        },
      },
      uniforms: {
        uModelMat: {
          locationName: 'u_ModelMat',
          type: Shader.Types.MATRIX4, // reduce code by making replacing "type" by extending ShaderUniform to abstract types
        },
        uNormalMat: {
          locationName: 'u_NormalMat',
          type: Shader.Types.MATRIX4,
        },
        uPerspectiveMat: {
          locationName: 'u_PerspectiveMat',
          type: Shader.Types.MATRIX4,
        },
        uViewMat: {
          locationName: 'u_ViewMat',
          type: Shader.Types.MATRIX4,
        },
        uAmbientMaterialColor: {
          locationName: 'u_AmbientMaterialColor',
          type: Shader.Types.VECTOR3,
          data: [1, 1, 1],
        },
        uLambertianMaterialColor: {
          locationName: 'u_LambertianMaterialColor',
          type: Shader.Types.VECTOR3,
          data: [1, 1, 1],
        },
        uSpecularMaterialColor: {
          locationName: 'u_SpecularMaterialColor',
          type: Shader.Types.VECTOR3,
          data: [1, 1, 1],
        },
        uCameraEye: {
          locationName: 'u_CameraEye',
          type: Shader.Types.VECTOR3,
        },
        uTextureWeight: {
          locationName: 'u_TextureWeight',
          type: Shader.Types.FLOAT,
          data: teapot.textureWeight,
        },
        uSamplerCube: {
          locationName: 'u_SamplerCube',
          type: Shader.Types.INTEGER,
          data: 0,
        },
      },
    }),
  }));

  scene.render({
    animate: true,
    draw() {
      iterateCubeOrbits();
      drawSkyBox(
          scene, camera,
          (skybox: Frame) => skybox.renderToCanvas());
      drawCubes(
          scene, camera, cubes,
          (cFrame: Frame) => cFrame.renderToCanvas());

      cubeCamera.renderTexture(
          (fBuffer: WebGLFramebuffer, rBuffer: WebGLRenderbuffer, cam: Camera) => {
            drawSkyBox(
                scene, cam,
                (skybox: Frame) =>
                    skybox.render(fBuffer, rBuffer));
            drawCubes(
                scene, cam, cubes,
                (cFrame: Frame) => cFrame.render(fBuffer, rBuffer));
          });

      const tpFrame = scene.getFrame('teapot');
      scene.gl.bindTexture(
          scene.gl.TEXTURE_CUBE_MAP, cubeCamera.texture);
      updateFrameView(tpFrame, camera);
      tpFrame.shader.setUniformData('uCameraEye', camera.eye);
      tpFrame.shader.setUniformData('uModelMat', teapot.modelMat);
      tpFrame.shader.setUniformData('uNormalMat', teapot.normalMat);
      tpFrame.renderToCanvas();
    },
  });

  initOrbitControls(camera);
})().catch(console.error);
