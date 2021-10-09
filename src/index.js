import {Material, ShaderMaterial} from './material.js';
import {Color, Vector3} from './math.js';
import WGPURenderer from './renderer.js';
import {
  Node,
  Mesh,
  OrthographicCamera,
  Scene
} from './scene.js';
import {
  createPlaneGeometry,
  toRadians
} from './utils.js';

const DOM_ELEMENTS_ID = {
  defaultShader: 'defaultShader',
  compileButton: 'compileButton',
  compiledStatus: 'compiledStatus',
  errorStatus: 'errorStatus',
  info: 'info',
  shaderTextarea: 'shaderTextarea'
};

export default class App {
  constructor(renderer, canvas) {
    this.renderer = renderer;
    this.canvas = canvas;

    const scene = new Scene();
    Color.set(scene.backgroundColor, 0.0, 0.0, 0.0);
    this.sceneNode = new Node(scene);

    const camera = new OrthographicCamera();
    this.cameraNode = new Node(camera);
    this.sceneNode.add(this.cameraNode);

    const geometry = createPlaneGeometry(2.0, 2.0);
    const material = new Material();
    const mesh = new Mesh(geometry, material);
    this.meshNode = new Node(mesh);
    this.sceneNode.add(this.meshNode);

    this._setupDomElements();
  }

  static async create() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgpu');

    if (!context) {
      throw new Error('Your browser does not seem to support WebGPU API');
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

    this.canvas.width = Math.floor(width * pixelRatio);
    this.canvas.height = Math.floor(height * pixelRatio);
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    this.renderer.setSize(width, height);
    this._render();
  }

  _setupDomElements() {
    const area = document.getElementById(DOM_ELEMENTS_ID.shaderTextarea);
    area.innerText = document.getElementById(DOM_ELEMENTS_ID.defaultShader).innerText.trim();

    const info = document.getElementById(DOM_ELEMENTS_ID.info);
    document.addEventListener('mouseenter', e => {
      info.style.opacity = 0.8;
    });
    document.addEventListener('mouseleave', e => {
      info.style.opacity = 0.0;
    });

    const button = document.getElementById(DOM_ELEMENTS_ID.compileButton);
    button.addEventListener('click', _ => {
      this._updateShader();
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

  async _updateShader() {
    this._cleanupHighlights();

    const shaderCode = document.getElementById(DOM_ELEMENTS_ID.shaderTextarea).innerText;
    const material = new ShaderMaterial(shaderCode);

    try {
      await this.renderer.compile(material);
    } catch (error) {
      this._updateStatusElement(false);
      this._highlightCompileErrors(error.messages);
      throw error;
    }

    this._updateStatusElement(true);
    this.meshNode.object.material = material;
  }

  _updateStatusElement(succeeded) {
    document.getElementById(DOM_ELEMENTS_ID.compiledStatus).style.display = succeeded ? '' : 'none';
    document.getElementById(DOM_ELEMENTS_ID.errorStatus).style.display = !succeeded ? '' : 'none';
  }

  _highlightCompileErrors(messages) {
    const area = document.getElementById(DOM_ELEMENTS_ID.shaderTextarea);
    // Assuming messages are position order
    messages.forEach(message => {
      const offset = this._findOffsetInShaderTextArea(message.lineNum);
      const range = document.createRange();
      range.setStart(area, offset);
      range.setEnd(area, offset + 1);
      const child = area.childNodes[offset];
      // Checking the node type just in case.
      const chunk = child.nodeType === window.Node.TEXT_NODE
        // I don't know why but -1 seems to be needed
        ? child.textContent.slice(message.linePos - 1, message.linePos + message.length - 1)
        : '';
      const mark = document.createElement('mark');
      mark.title = `${message.lineNum}:${message.linePos} ${message.message}, "${chunk}"`;
      range.surroundContents(mark);
    });
  }

  _cleanupHighlights() {
    const area = document.getElementById(DOM_ELEMENTS_ID.shaderTextarea);
    area.childNodes.forEach(child => {
      if (child.tagName && child.tagName.toLowerCase() === 'mark') {
        child.parentNode.insertBefore(child.childNodes[0], child);
        child.parentNode.removeChild(child);
      }
    });
  }

  _findOffsetInShaderTextArea(lineNum) {
    const area = document.getElementById(DOM_ELEMENTS_ID.shaderTextarea);
    if (lineNum === 1) {
      return 0;
    }
    let currentLineNum = 1;
    for (let i = 0; i < area.childNodes.length; i++) {
      const child = area.childNodes[i];
      if (child.tagName && child.tagName.toLowerCase() === 'br') {
        currentLineNum++;
      }
      if (lineNum === currentLineNum) {
        return i + 1;
      }
    }
    // @TODO: Error handling?
    return -1;
  }

  _animate() {
    this.sceneNode.object.update();
  }

  _render() {
    this.renderer.render(this.sceneNode, this.cameraNode);
  }
}
