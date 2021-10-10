import {Attribute, Geometry, Index} from './geometry.js';
import {Vector3} from './math.js';

export const createPlaneGeometry = (
  width = 1.0,
  height = 1.0,
  widthSegments = 1,
  heightSegments = 1
) => {
  const geometry = new Geometry();

  // from Three.js PlaneBufferGeometry

  const widthHalf = width * 0.5;
  const heightHalf = height * 0.5;
  const gridX = widthSegments;
  const gridY = heightSegments;
  const gridX1 = gridX + 1;
  const gridY1 = gridY + 1;
  const segmentWidth = width / gridX;
  const segmentHeight = height / gridY;

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let iy = 0; iy < gridY1; iy++) {
    const y = iy * segmentHeight - heightHalf;
    for (let ix = 0; ix < gridX1; ix++) {
      const x = ix * segmentWidth - widthHalf;
      positions.push(x, -y, 0.0);
      normals.push(0.0, 0.0, 1.0);
      uvs.push(ix / gridX, 1.0 - (iy / gridY));
    }
  }

  for (let iy = 0; iy < gridY; iy++) {
    for (let ix = 0; ix < gridX; ix++) {
      const a = ix + gridX1 * iy;
      const b = ix + gridX1 * (iy + 1);
      const c = (ix + 1) + gridX1 * (iy + 1);
      const d = (ix + 1) + gridX1 * iy;
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geometry.setAttribute('position', new Attribute(new Float32Array(positions), 3));
  geometry.setAttribute('normal', new Attribute(new Float32Array(normals), 3));
  geometry.setAttribute('uv', new Attribute(new Float32Array(uvs), 2));
  geometry.setIndex(new Index(new Uint16Array(indices)));
  return geometry;
};

export const createBoxGeometry = (
  width = 1.0,
  height = 1.0,
  depth = 1.0,
  widthSegments = 1.0,
  heightSegments = 1.0,
  depthSegments = 1.0
) => {
  const geometry = new Geometry();

  // from Three.js BoxBufferGeometry

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const vector = Vector3.create();

  let numberOfVertices = 0;

  const buildPlane = (u, v, w, udir, vdir, width, height, depth, gridX, gridY) => {
    const segmentWidth = width / gridX;
    const segmentHeight = height / gridY;
    const widthHalf = width * 0.5;
    const heightHalf = height * 0.5;
    const depthHalf = depth * 0.5;
    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;

    let positionCounter = 0;

    for (let iy = 0; iy < gridY1; iy++) {
      const y = iy * segmentHeight - heightHalf;
      for (let ix = 0; ix < gridX1; ix++) {
        const x = ix * segmentWidth - widthHalf;

        vector[u] = x * udir;
        vector[v] = y * vdir;
        vector[w] = depthHalf;

        positions.push(vector[0], vector[1], vector[2]);

        vector[u] = 0.0;
        vector[v] = 0.0;
        vector[w] = depth > 0 ? 1.0 : -1.0;

        normals.push(vector[0], vector[1], vector[2]);

        uvs.push(ix / gridX, 1.0 - (iy / gridY));

        positionCounter += 1;
      }
    }

    for (let iy = 0; iy < gridY; iy++) {
      for (let ix = 0; ix < gridX; ix++) {
        const a = numberOfVertices + ix + gridX1 * iy;
        const b = numberOfVertices + ix + gridX1 * (iy + 1);
        const c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
        const d = numberOfVertices + (ix + 1) + gridX1 * iy;
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    numberOfVertices += positionCounter;
  };

  buildPlane(2, 1, 0, -1.0, -1.0, depth, height, width, depthSegments, heightSegments);
  buildPlane(2, 1, 0, 1.0, -1.0, depth, height, -width, depthSegments, heightSegments);
  buildPlane(0, 2, 1, -1.0, -1.0, width, depth, height, widthSegments, depthSegments);
  buildPlane(0, 2, 1, -1.0, -1.0, width, depth, -height, widthSegments, depthSegments);
  buildPlane(0, 1, 2, -1.0, -1.0, width, height, depth, widthSegments, heightSegments);
  buildPlane(0, 1, 2, -1.0, -1.0, width, height, -depth, widthSegments, heightSegments);

  geometry.setAttribute('position', new Attribute(new Float32Array(positions), 3));
  geometry.setAttribute('normal', new Attribute(new Float32Array(normals), 3));
  geometry.setAttribute('uv', new Attribute(new Float32Array(uvs), 2));
  geometry.setIndex(new Index(new Uint16Array(indices)));

  return geometry;
};

export const toRadians = degrees => {
  return degrees * Math.PI / 180.0;
};
