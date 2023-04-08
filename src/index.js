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
import './wgsl-mode.js';

const DOM_ELEMENTS_ID = {
  defaultShader: 'defaultShader',
  cameraSelect: 'cameraSelect',
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

    this._errorMarks = [];
    this._editor = this._createEditor();
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

  _createEditor() {
    const area = document.getElementById(DOM_ELEMENTS_ID.shaderTextarea);
    area.value = document.getElementById(DOM_ELEMENTS_ID.defaultShader).innerText.trim();

    const inputQueue = [];
    const editor = CodeMirror.fromTextArea(area, {
      lineNumbers: true,
      matchBrackets: true,
      indentWithTabs: true,
      tabSize: 4,
      indentUnit: 4,
      mode: 'wgsl',
      theme: 'ayu-dark'
    });
    editor.on('change', () => {
      inputQueue.push(0);
      setTimeout(() => {
        inputQueue.pop();
        if (inputQueue.length === 0) {
          this._updateShader();
        }
      }, 500);
    });

    return editor;
  }

  _setupDomElements() {
    const info = document.getElementById(DOM_ELEMENTS_ID.info);
    document.addEventListener('mouseenter', () => {
      info.style.opacity = 0.8;
    });
    document.addEventListener('mouseleave', () => {
      info.style.opacity = 0.0;
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
    const shaderCode = this._editor.getValue();
    const material = new ShaderMaterial(shaderCode);

    this._removeCompileErrorHightlights();

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

  _removeCompileErrorHightlights() {
    this._errorMarks.forEach(mark => {
      mark.clear();
    });
    this._errorMarks.length = 0;
  }

  _highlightCompileErrors(messages) {
    for (let index = 0; index < messages.length; index++) {
      const message = messages[index];

      this._errorMarks.push(
        this._editor.markText(
          {
            line: message.lineNum - 1,
            ch: message.linePos - 1
          },
          {
            line: message.lineNum - 1,
            ch: message.linePos - 1 + message.length
          },
          {
            className: 'errorMark',
            attributes: {title: message.message}
          }
        )
      );
    }
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