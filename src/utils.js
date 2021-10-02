import {Attribute, Geometry, Index} from './geometry.js';

export const createPlaneGeometry = (width = 1.0, height = 1.0) => {
  const geometry = new Geometry();

  geometry.setAttribute('position', new Attribute(new Float32Array([
    -0.5 * width, 0.5 * height, 0.0,
    0.5 * width, 0.5 * height, 0.0,
    -0.5 * width, -0.5 * height, 0.0,
    0.5 * width, -0.5 * height, 0.0
  ])), 3);

  geometry.setAttribute('normal', new Attribute(new Float32Array([
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0
  ])), 3);

  geometry.setAttribute('uv', new Attribute(new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    1.0, 1.0
  ])), 2);

  geometry.setIndex(new Index(new Uint16Array([
    0, 1, 2,
    1, 3, 2
  ])));

  return geometry;
};

export const toRadians = degrees => {
  return degrees * Math.PI / 180.0;
};
