export class Geometry {
  constructor() {
    this._attributes = new Map();
    this._index = null;
  }

  setAttribute(key, attribute) {
    this._attributes.set(key, attribute);
    return this;
  }

  getAttribute(key) {
    return this._attributes.get(key);
  }

  hasAttribute(key) {
    return this._attributes.has(key);
  }

  setIndex(index) {
    this._index = index;
    return this;
  }

  getIndex() {
    return this._index;
  }

  hasIndex() {
    return this._index !== null;
  }
}

export class Attribute {
  constructor(data, itemSize) {
    this.data = data;
    this.count = this.data.length / itemSize;
  }
}

export class Index {
  constructor(data) {
    this.data = data;
    this.count = this.data.length;
  }
}
