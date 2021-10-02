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
  info: 'info',
  runButton: 'runButton',
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
    area.value = document.getElementById(DOM_ELEMENTS_ID.defaultShader).innerText.trim();

    const info = document.getElementById(DOM_ELEMENTS_ID.info);
    document.addEventListener('mouseenter', e => {
      info.style.opacity = 0.8;
    });
    document.addEventListener('mouseleave', e => {
      info.style.opacity = 0.0;
    });

    const button = document.getElementById(DOM_ELEMENTS_ID.runButton);
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
    const shaderCode = document.getElementById(DOM_ELEMENTS_ID.shaderTextarea).value;
    const material = new ShaderMaterial(shaderCode);

    try {
      await this.renderer.compile(material);
    } catch (error) {
      // @TODO: Improve error handling
      window.alert(error + ' Watch the console.');
      throw error;
    }

    this.meshNode.object.material = material;
  }

  _animate() {
    this.sceneNode.object.update();
  }

  _render() {
    this.renderer.render(this.sceneNode, this.cameraNode);
  }
}
