import {ShaderMaterial} from './material.js';
import {
  Color,
  Matrix3,
  Matrix3GPU,
  Matrix4
} from './math.js';
import {
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  Scene
} from './scene.js';

const DEFAULT_WIDTH = 640.0;
const DEFAULT_HEIGHT = 480.0;
const DEFAULT_PIXEL_RATIO = 1.0;

const ATTRIBUTE_NAMES = ['position', 'normal', 'uv'];

export default class WGPURenderer {
  constructor(adapter, device, context) {
    this._adapter = adapter;
    this._device = device;
    this._width = DEFAULT_WIDTH;
    this._height = DEFAULT_HEIGHT;
    this._pixelRatio = DEFAULT_PIXEL_RATIO;
    this._context = context;
    this._swapChain = this._context.configure(createContextConfiguration(
      this._device,
      this._width,
      this._height,
      this._pixelRatio
    ));
    this._depthBuffer = createDepthBuffer(
      this._device,
      this._width,
      this._height,
      this._pixelRatio
    );
    this._renderPassDescriptor = {
      colorAttachments: [{
        loadValue: {r: 0.0, g: 0.0, b: 0.0, a: 1.0},
        view: null // setup in render()
      }],
      depthStencilAttachment: {
        depthLoadValue: 1.0,
        depthStoreOp: 'store',
        stencilLoadValue: 0.0,
        stencilStoreOp: 'store',
        view: null // setup in render()
      }
    };
    this._renderPipelines = new WGPURenderPipelines();
    this._attributes = new WGPUAttributes();
    this._indices = new WGPUIndices();
    this._bindings = new WGPUBindings();
  }

  static async create(canvas) {
    const adapter = await navigator.gpu.requestAdapter();

    if (adapter === null) {
      // @TODD: Error handling
      throw new Error();
    }

    const device = await adapter.requestDevice({});

    return new WGPURenderer(adapter, device, canvas);
  }

  setSize(width, height) {
    this._width = width;
    this._height = height;
    this._updateContextConfiguration();
    this._recreateDepthBuffer();
  }

  setPixelRatio(pixelRatio) {
    this._pixelRatio = pixelRatio;
    this._updateContextConfiguration();
    this._recreateDepthBuffer();
  }

  async compile(material) {
    if (!(material instanceof ShaderMaterial)) {
      // @TODO: Error handling
      return;
    }
    this._renderPipelines.update(this._device, material);
    const module = this._renderPipelines.get(material).module;
    const log = await module.getLog();
    if (log.messages.length > 0) {
      this._renderPipelines.remove(material);
      throw new Error('Compile error');
    }
  }

  render(sceneNode, cameraNode) {
    const scene = sceneNode.object;
    const camera = cameraNode.object;

    if (!(scene instanceof Scene) ||
      (!(camera instanceof PerspectiveCamera) && !(camera instanceof OrthographicCamera))) {
      // @TODO: Error handling
      return;
    }

    // No graph but flat yet
    sceneNode.children.forEach(child => child.updateMatrix());

	const encoder = this._device.createCommandEncoder({});

    const colorAttachment = this._renderPassDescriptor.colorAttachments[0];
    colorAttachment.view = this._context.getCurrentTexture().createView();
    colorAttachment.loadValue.r = scene.backgroundColor[0];
    colorAttachment.loadValue.g = scene.backgroundColor[1];
    colorAttachment.loadValue.b = scene.backgroundColor[2];

    this._renderPassDescriptor.depthStencilAttachment.view =
      this._depthBuffer.createView();

    const pass = encoder.beginRenderPass(this._renderPassDescriptor);

    sceneNode.children.forEach(node => {
      const mesh = node.object;

      if (!(mesh instanceof Mesh)) {
        return;
      }

      const material = mesh.material;
      this._renderPipelines.update(this._device, material);
      const pipeline = this._renderPipelines.get(material).pipeline.pipeline;
      pass.setPipeline(pipeline);

      this._bindings.update(this._device, pipeline, node, scene, cameraNode, camera);
      const binding = this._bindings.get(pipeline);
      pass.setBindGroup(0, binding.group);

      const geometry = mesh.geometry;

      for (let i = 0; i < ATTRIBUTE_NAMES.length; i++) {
        const attributeName = ATTRIBUTE_NAMES[i];
        if (geometry.hasAttribute(attributeName)) {
          const attribute = geometry.getAttribute(attributeName);
          this._attributes.update(this._device, attribute);
          pass.setVertexBuffer(i, this._attributes.get(attribute));
        }
      }

      if (geometry.hasIndex()) {
        const index = geometry.getIndex();
        this._indices.update(this._device, index);
        pass.setIndexBuffer(this._indices.get(index), 'uint16');
        pass.drawIndexed(index.count, 1);
      } else {
        pass.draw();
      }
    });

    pass.endPass();
    this._device.queue.submit([encoder.finish()]);
  }

  _updateContextConfiguration() {
    this._context.configure(createContextConfiguration(
      this._device,
      this._width,
      this._height,
      this._pixelRatio
    ));
  }

  _recreateDepthBuffer() {
    this._depthBuffer.destroy();
    this._depthBuffer = createDepthBuffer(
      this._device,
      this._width,
      this._height,
      this._pixelRatio
    );
  }
}

const createContextConfiguration = (device, width, height, pixelRatio) => {
  return {
    device: device,
    format: 'bgra8unorm',
    size: {
      width: Math.floor(width * pixelRatio),
      height: Math.floor(height * pixelRatio),
      depthOrArrayLayers: 1
    },
    usage: GPUTextureUsage.RENDER_ATTACHMENT
  };
};

const createDepthBuffer = (device, width, height, pixelRatio) => {
  return device.createTexture({
    format: 'depth24plus-stencil8',
    sampleCount: 1,
    size: {
      width: Math.floor(width * pixelRatio),
      height: Math.floor(height * pixelRatio),
      depthOrArrayLayers: 1
    },
    usage: GPUTextureUsage.RENDER_ATTACHMENT
  });
};

class WGPUShaderModule {
  constructor(device, shaderCode) {
    this.module = device.createShaderModule({
      code: shaderCode
    });
  }

  getLog(device) {
    return this.module.compilationInfo();
  }
}

class WGPURenderPipeline {
  constructor(device, shaderModule) {
    this.pipeline = device.createRenderPipeline({
      depthStencil: {
        depthWriteEnabled: true,
        format: 'depth24plus-stencil8'
      },
      fragment: {
        entryPoint: 'fs_main',
        module: shaderModule,
        targets: [{
          // @TODO: Support alpha blend
          format: 'bgra8unorm'
        }]
      },
      multisample: {
        count: 1
      },
      primitive: {
        topology: 'triangle-list'
      },
      vertex: {
        buffers: [
          // position
          {
            arrayStride: 3 * 4,
            attributes: [{
              format: 'float32x3',
              offset: 0,
              shaderLocation: 0
            }],
            stepMode: 'vertex'
          },
          // normal
          {
            arrayStride: 3 * 4,
            attributes: [{
              format: 'float32x3',
              offset: 0,
              shaderLocation: 1
            }],
            stepMode: 'vertex'
          },
          // uv
          {
            arrayStride: 2 * 4,
            attributes: [{
              format: 'float32x2',
              offset: 0,
              shaderLocation: 2
            }],
            stepMode: 'vertex'
          }
        ],
        entryPoint: 'vs_main',
        module: shaderModule
      }
    });
  }
}

// @TODO: Implement correctly
class WGPURenderPipelines {
  constructor(device) {
    this._pipelines = new WeakMap();
  }

  get(material) {
    return this._pipelines.get(material);
  }

  // @TODO: Dispose unused pipelines
  update(device, material) {
    if (!(material instanceof ShaderMaterial)) {
      return;
    }
    if (this._pipelines.has(material)) {
      return;
    }
    const module = new WGPUShaderModule(device, material.shaderCode);
    this._pipelines.set(material, {
      module: module,
      pipeline: new WGPURenderPipeline(device, module.module),
    });
  }

  remove(material) {
    this._pipelines.delete(material);
  }
}

class WGPUAttributes {
  constructor() {
    this._attributes = new WeakMap();
  }

  get(attribute) {
    return this._attributes.get(attribute);
  }

  update(device, attribute) {
    if (this._attributes.has(attribute)) {
      return;
    }

    this._attributes.set(attribute, createAndInitBuffer(
      device,
      attribute.data,
      GPUBufferUsage.VERTEX
    ));
  }
}

class WGPUIndices {
  constructor() {
    this._indices = new WeakMap();
  }

  get(index) {
    return this._indices.get(index);
  }

  update(device, index) {
    if (this._indices.has(index)) {
      return;
    }

    this._indices.set(index, createAndInitBuffer(
      device,
      index.data,
      GPUBufferUsage.INDEX
    ));
  }
}

const _normalMatrix = Matrix3.create();
const _normalMatrixGPU = Matrix3GPU.create();
const _modelViewMatrix = Matrix4.create();
const _cameraMatrixInverse = Matrix4.create();
const _elapsedTime = new Float32Array(1);

// @TODO: Implement correctly
class WGPUBindings {
  constructor() {
    this._bindings = new WeakMap();
  }

  get(pipeline) {
    return this._bindings.get(pipeline);
  }

  // @TODO: Dispose unused groups
  update(device, pipeline, node, scene, cameraNode, camera) {
    if (!this._bindings.has(pipeline)) {
      const layout = pipeline.getBindGroupLayout(0);
      const buffers = [
        // model-view matrix, normal matrix
        createAndInitBuffer(
          device,
          new Float32Array(16 + 12),
          GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        ),
        // projection matrix
        createAndInitBuffer(
          device,
          new Float32Array(16),
          GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        ),
        // elapsed time
        createAndInitBuffer(
          device,
          new Float32Array(1),
          GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        )
      ];
      const group = device.createBindGroup({
        entries: [
          // model-view matrix, normal matrix
          {
            binding: 0,
            resource: {
              buffer: buffers[0]
            }
          },
          // projection matrix
          {
            binding: 1,
            resource: {
              buffer: buffers[1]
            }
          },
          // elapsed time
          {
            binding: 2,
            resource: {
              buffer: buffers[2]
            }
          }
        ],
        layout: layout
      });
      this._bindings.set(pipeline, {
        buffers: buffers,
        layout: layout,
        group: group
      });
    }

    Matrix4.copy(_cameraMatrixInverse, cameraNode.getMatrix());
    Matrix4.invert(_cameraMatrixInverse);
    Matrix4.copy(_modelViewMatrix, _cameraMatrixInverse, node.getMatrix());
    Matrix3.makeNormalFromMatrix4(_normalMatrix, _modelViewMatrix);
    Matrix3GPU.copyFromMatrix3(_normalMatrixGPU, _normalMatrix);
    // in seconds
    _elapsedTime[0] = scene.elapsedTime * 0.001;

    const binding = this._bindings.get(pipeline);
    device.queue.writeBuffer(binding.buffers[0], 0, _modelViewMatrix, 0);
    device.queue.writeBuffer(binding.buffers[0], 64, _normalMatrixGPU, 0);
    device.queue.writeBuffer(binding.buffers[1], 0, camera.projectionMatrix, 0);
    device.queue.writeBuffer(binding.buffers[2], 0, _elapsedTime, 0);
  }
}

const createAndInitBuffer = (device, array, usage) => {
  const buffer = device.createBuffer( {
    size: array.byteLength,
    usage: usage,
    mappedAtCreation: true,
  });

  new array.constructor(buffer.getMappedRange()).set(array);
  buffer.unmap();
  return buffer;	
}
