import {Attribute, Geometry, Index} from './geometry.js';
import {Vector3} from './math.js';

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

export const createBoxGeometry = (width = 1.0, height = 1.0, depth = 1.0) => {
  const geometry = new Geometry();

  // @TODO: Clean up
  const params = [
    // front
    {
      x: -0.5,
      y: 0.5,
      z: 0.5,
      dx: [0.0, 1.0, 0.0, 1.0],
      dy: [0.0, 0.0, -1.0, -1.0],
      dz: [0.0, 0.0, 0.0, 0.0]
    },
    // right
    {
      x: 0.5,
      y: 0.5,
      z: 0.5,
      dx: [0.0, 0.0, 0.0, 0.0],
      dy: [0.0, 0.0, -1.0, -1.0],
      dz: [-1.0, 0.0, -1.0, 0.0]
    },
    // back
    {
      x: 0.5,
      y: 0.5,
      z: -0.5,
      dx: [0.0, -1.0, 0.0, -1.0],
      dy: [0.0, 0.0, -1.0, -1.0],
      dz: [0.0, 0.0, 0.0, 0.0]
    },
    // left
    {
      x: -0.5,
      y: 0.5,
      z: -0.5,
      dx: [0.0, 0.0, 0.0, 0.0],
      dy: [0.0, 0.0, -1.0, -1.0],
      dz: [1.0, 0.0, 1.0, 0.0]
    },
    // top
    {
      x: -0.5,
      y: 0.5,
      z: -0.5,
      dx: [0.0, 1.0, 0.0, 1.0],
      dy: [0.0, 0.0, 0.0, 0.0],
      dz: [0.0, 0.0, 1.0, 1.0]
    },
    // bottom
    {
      x: -0.5,
      y: -0.5,
      z: 0.5,
      dx: [0.0, 1.0, 0.0, 1.0],
      dy: [0.0, 0.0, 0.0, 0.0],
      dz: [0.0, 0.0, -1.0, -1.0]
    }
  ];

  const positionVec = Vector3.create();
  const normalVec = Vector3.create();
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let face = 0; face < 6; face++) {
    const {x, y, z, dx, dy, dz} = params[face];
    for (let i = 0; i < 4; i++) {
      Vector3.set(
        positionVec,
        (x + dx[i]) * width,
        (y + dy[i]) * height,
        (z + dz[i]) * depth
      );

      Vector3.copy(normalVec, positionVec);
      Vector3.normalize(normalVec);

      for (let j = 0; j < 3; j++) {
        positions.push(positionVec[j]);
        normals.push(normalVec[j]);
      }
    }

    uvs.push(0.0);
    uvs.push(0.0);

    uvs.push(1.0);
    uvs.push(0.0);

    uvs.push(0.0);
    uvs.push(1.0);

    uvs.push(1.0);
    uvs.push(1.0);

    indices.push(face * 4 + 0);
    indices.push(face * 4 + 1);
    indices.push(face * 4 + 2);

    indices.push(face * 4 + 1);
    indices.push(face * 4 + 3);
    indices.push(face * 4 + 2);
  }

  geometry.setAttribute('position', new Attribute(new Float32Array(positions), 3));
  geometry.setAttribute('normal', new Attribute(new Float32Array(normals), 3));
  geometry.setAttribute('uv', new Attribute(new Float32Array(uvs), 2));
  geometry.setIndex(new Index(new Uint16Array(indices)));

  return geometry;
};

export const toRadians = degrees => {
  return degrees * Math.PI / 180.0;
};
