import {
  mat4,
  vec3,
  vec4,
} from 'gl-matrix';

import {
  SKYBOX_FRAGMENT_SHADER,
  SKYBOX_VERTEX_SHADER,
  VERTEX_SHADER,
  CUBES_FRAGMENT_SHADER,
} from './lib/constants';
import Camera from './lib/Camera';
import Scene from './lib/Scene';
import RenderFrame from './lib/RenderFrame';
import Shader from './lib/Shader';
import CubeModel from './lib/CubeModel';


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
    (): vec3 =>
      vec3.fromValues(
        Math.random(), Math.random(), Math.random()));
  const dThetas = orbitAxialVectors.map((): number => Math.random() / 120);

  let t = 0;

  return () => cubes.forEach((model: CubeModel, i: number) => {
    t += 1;
    let position: vec3;
    position = rotateVector(dThetas[i] * t, orbitAxialVectors[i], radialVectors[i]);
    model.setPosition(position);
    model.rotate(dThetas[i] * 5, rotationAxialVectors[i]);
  });
}


function updateFrameView(frame: RenderFrame, camera: Camera) {
  frame.shader.setUniformData('uPerspectiveMat', camera.perspectiveMat);
  frame.shader.setUniformData('uViewMat', camera.lookAtMat);
}


(async function main() {
  const canvas =
    <HTMLCanvasElement>document.getElementById('canvas');
  const camera = new Camera();
  const scene = new Scene(canvas);

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

  scene.setRenderFrame('skybox', new RenderFrame({
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

  scene.setRenderFrame('cubes', new RenderFrame({ // replace with "frame"
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

  scene.render({
    animate: true,
    draw({ firstRender }) {
      // render sky box
      const skyboxFrame = scene.getRenderFrame('skybox');
      updateFrameView(skyboxFrame, camera);
      scene.gl.activeTexture(scene.gl.TEXTURE0);
      scene.gl.bindTexture(scene.gl.TEXTURE_CUBE_MAP, scene.getTexture('skybox'));
      skyboxFrame.render(firstRender);

      // render cubes
      const cubeFrame = scene.getRenderFrame('cubes');
      iterateCubeOrbits();
      updateFrameView(cubeFrame, camera);
      cubeFrame.shader.setUniformData('uCameraEye', camera.eye);
      cubes.map((cube: CubeModel) => {
        cubeFrame.shader.setAttributeData('aPosition', cube.vertices);
        cubeFrame.shader.setAttributeData('aNormal', cube.normals);
        cubeFrame.shader.setUniformData('uModelMat', cube.modelMat);
        cubeFrame.shader.setUniformData('uNormalMat', cube.normalMat);
        cubeFrame.shader.setUniformData(
          'uAmbientMaterialColor', cube.ambientMaterialColor);
        cubeFrame.shader.setUniformData(
          'uLambertianMaterialColor', cube.lambertianMaterialColor);
        cubeFrame.shader.setUniformData(
          'uSpecularMaterialColor', cube.specularMaterialColor);
        cubeFrame.render(firstRender);
      });
    },
  });

  initOrbitControls(camera);
})().catch(console.error);
