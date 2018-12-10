import {
  SKYBOX_FRAGMENT_SHADER,
  SKYBOX_VERTEX_SHADER,
} from './lib/constants';
import Camera from './lib/Camera';
import Scene from './lib/Scene';
import RenderFrame from './lib/RenderFrame';
import Shader from './lib/Shader';
import CubeModel from './lib/CubeModel';
import { initOrbitControls } from './lib/controls';


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
          data: camera.perspectiveMat,
        },
        uViewMat: {
          locationName: 'u_ViewMat',
          type: Shader.Types.MATRIX4,
          data: camera.lookAtMat,
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
    draw({ firstRender }) {
      // render sky box
      const skybox = scene.getRenderFrame('skybox');
      skybox.shader.setUniformData('uPerspectiveMat', camera.perspectiveMat);
      skybox.shader.setUniformData('uViewMat', camera.lookAtMat);
      scene.gl.activeTexture(scene.gl.TEXTURE0);
      scene.gl.bindTexture(scene.gl.TEXTURE_CUBE_MAP, scene.getTexture('skybox'));
      skybox.render(firstRender);
    },
  });

  initOrbitControls(camera);
})();
