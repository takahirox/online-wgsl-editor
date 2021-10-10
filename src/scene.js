import {
  Color,
  Euler,
  Matrix4,
  Vector3,
  Quaternion
} from './math.js';

export class Node {
  // @TODO: Rename object to better one?
  constructor(object) {
    this.position = Vector3.create();
    this.rotation = Euler.create();
    this.scale = Vector3.set(Vector3.create(), 1.0, 1.0, 1.0);
    this._quaternion = Quaternion.create();
    this._matrix = Matrix4.create();
    this.children = [];
    this.parent = null;
    this.object = object;
  }

  add(child) {
    this.children.push(child);
    return this;
  }

  setObject(object) {
    this.object = object;
    return this;
  }

  getMatrix() {
    return this._matrix;
  }

  updateMatrix() {
    Quaternion.setFromEuler(this._quaternion, this.rotation);
    Matrix4.compose(this._matrix, this.position, this._quaternion, this.scale);
    return this;
  }
}

export class Scene {
  constructor() {
    this.backgroundColor = Color.set(Color.create(), 1.0, 1.0, 1.0);
    this.elapsedTime = null;
    this._startTime = null;
  }

  update() {
    const currentTime = performance.now();
    if (this._startTime === null) {
      this._startTime = currentTime;
    }
    this.elapsedTime = currentTime - this._startTime;
  }
}

export class PerspectiveCamera {
  constructor(fovy = 1.0, aspect = 1.0, far = 1000.0, near = 0.001) {
    this.fovy = fovy;
    this.aspect = aspect;
    this.far = far;
    this.near = near;
    this.projectionMatrix = Matrix4.create();
    this.projectionMatrixInverse = Matrix4.create();
    this.updateProjectionMatrix();
  }

  updateProjectionMatrix() {
    Matrix4.makePerspective(
      this.projectionMatrix,
      this.fovy,
      this.aspect,
      this.near,
      this.far
    );
    Matrix4.invert(Matrix4.copy(this.projectionMatrixInverse, this.projectionMatrix));
    return this;
  }
}

export class OrthographicCamera {
  constructor(left = -1, right = 1, top = 1, bottom = -1, near = 0.0, far = 2000.0) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.near = near;
    this.far = far;
    this.projectionMatrix = Matrix4.create();
    this.projectionMatrixInverse = Matrix4.create();
    this.updateProjectionMatrix();
  }

  updateProjectionMatrix() {
    Matrix4.makeOrthogonal(
      this.projectionMatrix,
      this.left,
      this.right,
      this.bottom,
      this.top,
      this.near,
      this.far
    );
    Matrix4.invert(Matrix4.copy(this.projectionMatrixInverse, this.projectionMatrix));
    return this;
  }
}

export class Mesh {
  constructor(geometry, material) {
    this.geometry = geometry;
    this.material = material;
  }
}
