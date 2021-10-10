import {Material, ShaderMaterial} from './material.js';
import {Color, Euler, Vector3} from './math.js';
import WGPURenderer from './renderer.js';
import {
  Node,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  Scene
} from './scene.js';
import {
  createBoxGeometry,
  createPlaneGeometry,
  toRadians
} from './utils.js';

const DOM_ELEMENTS_ID = {
  defaultShader: 'defaultShader',
  cameraSelect: 'cameraSelect',
  compileButton: 'compileButton',
  compiledStatus: 'compiledStatus',
  errorStatus: 'errorStatus',
  geometrySelect: 'geometrySelect',
  info: 'info',
  rotationCheckbox: 'rotationCheckbox',
  shaderTextarea: 'shaderTextarea'
};

export const GEOMETRY_TYPE = {
  plane: 0,
  box: 1
};

export const CAMERA_TYPE = {
  orthographic: 0,
  perspective: 1
};

const SEGMENT_NUM = 64;
const _tmpRotation = Euler.create();

export default class App {
  constructor(renderer, canvas) {
    this._renderer = renderer;
    this._canvas = canvas;
    this._autoRotation = false;

    const scene = new Scene();
    Color.set(scene.backgroundColor, 0.0, 0.0, 0.0);
    this._sceneNode = new Node(scene);

    this._orthographicCamera = new OrthographicCamera();
    this._perspectiveCamera = new PerspectiveCamera(
      toRadians(60),
      window.innerWidth / window.innerHeight,
      2000.0,
      0.001
    );
    this._cameraNode = new Node(this._orthographicCamera);
    Vector3.set(this._cameraNode.position, 0.0, 0.0, 2.0);
    this._sceneNode.add(this._cameraNode);

    const mesh = new Mesh(
      createPlaneGeometry(2.0, 2.0, SEGMENT_NUM, SEGMENT_NUM), new Material());
    this._meshNode = new Node(mesh);
    this._sceneNode.add(this._meshNode);

    this._setupDomElements();
  }

  static async create() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgpu');

    if (!context) {
      throw new UnsupportedWebGPUError('Your browser does not seem to support WebGPU API');
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const renderer = await WGPURenderer.create(context);
    renderer.setPixelRatio(window.devicePixelRatio);

    const app = new App(renderer, canvas);

    await app._updateShader();
    app.resize();

    window.addEventListener('resize', app.resize.bind(app));

    return app;
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio;

    this._canvas.width = Math.floor(width * pixelRatio);
    this._canvas.height = Math.floor(height * pixelRatio);
    this._canvas.style.width = width + 'px';
    this._canvas.style.height = height + 'px';

    this._perspectiveCamera.aspect = width / height;
    this._perspectiveCamera.updateProjectionMatrix();

    this._renderer.setSize(width, height);
    this._render();
  }

  _setupDomElements() {
    const area = document.getElementById(DOM_ELEMENTS_ID.shaderTextarea);
    area.innerText = document.getElementById(DOM_ELEMENTS_ID.defaultShader).innerText.trim();

    const info = document.getElementById(DOM_ELEMENTS_ID.info);
    document.addEventListener('mouseenter', () => {
      info.style.opacity = 0.8;
    });
    document.addEventListener('mouseleave', () => {
      info.style.opacity = 0.0;
    });

    const button = document.getElementById(DOM_ELEMENTS_ID.compileButton);
    button.addEventListener('click', () => {
      this._updateShader();
    });

    const cameraSelect = document.getElementById(DOM_ELEMENTS_ID.cameraSelect);
    cameraSelect.addEventListener('change', e => {
      const option = e.target.options[e.target.selectedIndex];
      this._switchCamera(
        option.value === 'orthographic'
          ? CAMERA_TYPE.orthographic : CAMERA_TYPE.perspective
      );
    });

    const geometrySelect = document.getElementById(DOM_ELEMENTS_ID.geometrySelect);
    geometrySelect.addEventListener('change', e => {
      const option = e.target.options[e.target.selectedIndex];
      this._switchGeometry(
        option.value === 'plane'
          ? GEOMETRY_TYPE.plane : GEOMETRY_TYPE.box
      );
    });

    const roatationCheckbox = document.getElementById(DOM_ELEMENTS_ID.rotationCheckbox);
    rotationCheckbox.addEventListener('change', e => {
      this._enableAutoRotation(e.target.checked);
    });
  }

  start() {
    const run = timestamp => {
      requestAnimationFrame(run);
      this._animate();
      this._render();
    };
    run();
  }

  _switchCamera(cameraType) {
    this._cameraNode.setObject(
      cameraType === CAMERA_TYPE.orthographic
        ? this._orthographicCamera
        : this._perspectiveCamera
    );
  }

  _switchGeometry(geometryType) {
    const node = this._meshNode
    const mesh = node.object;
    if (geometryType === GEOMETRY_TYPE.plane) {
      mesh.geometry = createPlaneGeometry(2.0, 2.0, SEGMENT_NUM, SEGMENT_NUM);
      Vector3.set(node.position, 0.0, 0.0, 0.0);
      Euler.set(node.rotation, 0.0, 0.0, 0.0);
    } else {
      mesh.geometry = createBoxGeometry(
        2.0, 2.0, 2.0, SEGMENT_NUM, SEGMENT_NUM, SEGMENT_NUM);
      Vector3.set(node.position, 0.0, 0.0, -2.0);
      Euler.set(node.rotation, toRadians(30.0), 0.0, 0.0);
    }
  }

  _enableAutoRotation(enabled) {
    this._autoRotation = enabled;
    Euler.setY(this._meshNode.rotation, 0.0);
  }

  async _updateShader() {
    this._flattenTextarea();

    const shaderCode = document.getElementById(DOM_ELEMENTS_ID.shaderTextarea).innerText;
    const material = new ShaderMaterial(shaderCode);

    try {
      await this._renderer.compile(material);
    } catch (error) {
      this._updateStatusElement(false);
      this._highlightCompileErrors(error.messages);
      throw error;
    }

    this._updateStatusElement(true);
    this._meshNode.object.material = material;
  }

  _updateStatusElement(succeeded) {
    document.getElementById(DOM_ELEMENTS_ID.compiledStatus).style.display = succeeded ? '' : 'none';
    document.getElementById(DOM_ELEMENTS_ID.errorStatus).style.display = !succeeded ? '' : 'none';
  }

  _highlightCompileErrors(messages) {
    const area = document.getElementById(DOM_ELEMENTS_ID.shaderTextarea);
    // Assuming messages are position order
    for (let index = 0; index < messages.length; index++) {
      let message = messages[index];
      const lineNum = message.lineNum;
      const linePoses = [];
      const lengthes = [];
      const params = [];
      while (true) {
        params.push({linePos: message.linePos, length: message.length, message: message.message});
        if (index >= messages.length - 1 || messages[index + 1].lineNum !== lineNum) {
          break;
        }
        message = messages[++index];
      }
      const {parent, offset} = this._findTargetRangeInTextarea(lineNum);
      const range = document.createRange();
      range.setStart(parent, offset);
      range.setEnd(parent, offset + 1);
      const child = parent.childNodes[offset];
      let title = '';
      for (const param of params) {
        const chunk =
          // I don't know why but -1 seems to be needed
          child.textContent.slice(param.linePos - 1, param.linePos + param.length - 1);
        title += `- ${lineNum}:${param.linePos} ${param.message}, "${chunk}"\n`;
      }
      const mark = document.createElement('mark');
      mark.title = title;
      range.surroundContents(mark);
    }
  }

  _flattenTextarea() {
    const area = document.getElementById(DOM_ELEMENTS_ID.shaderTextarea);
    // I'm not sure if this can flatten the elements on all platforms.
    area.innerText = area.innerText;
  }

  _findTargetRangeInTextarea(lineNum) {
    const area = document.getElementById(DOM_ELEMENTS_ID.shaderTextarea);

    let currentLineNum = 1;

    const traverse = (element, parent) => {
      let offset = 0;
      while (element) {
        if (element.tagName && element.tagName.toLowerCase() === 'br') {
          currentLineNum++;
        } else if (element.tagName && element.tagName.toLowerCase() === 'div') {
          currentLineNum++;
          const result = traverse(element.firstChild, element);
          if (result) {
            return result;
          }
          currentLineNum--;
        } else if (element.nodeType === window.Node.TEXT_NODE) {
          if (currentLineNum === lineNum) {
            return {
              parent: parent,
              offset: offset
            };
          }
        } else if (!element.tagName || element.tagName.toLowerCase() !== 'mark') {
          // Unexpected element
          return null;
        }
        element = element.nextSibling;
        offset += 1;
      }
      return null;
    };

    const result = traverse(area.firstChild, area);
    if (result) {
      return result;
    }

    throw new Error('Failed to find line num ' + lineNum);
  }

  _animate() {
    this._sceneNode.object.update();
    if (this._autoRotation) {
      Euler.add(this._meshNode.rotation, Euler.set(_tmpRotation, 0.0, 0.005, 0.0));
    }
  }

  _render() {
    this._renderer.render(this._sceneNode, this._cameraNode);
  }
}

export class UnsupportedWebGPUError extends Error {
  constructor(...params) {
    super(...params);
  }
}