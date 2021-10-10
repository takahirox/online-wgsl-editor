export class Color {
  static create() {
    return new Float32Array(3);
  }

  static set(m, r, g, b) {
    m[0] = r;
    m[1] = g;
    m[2] = b;
    return m;
  }
}

export class Vector3 {
  static create() {
    return new Float32Array(3);
  }

  static set(v, x, y, z) {
    v[0] = x;
    v[1] = y;
    v[2] = z;
    return v;
  }

  static setX(v, value) {
    v[0] = value;
    return v;
  }

  static setY(v, value) {
    v[1] = value;
    return v;
  }

  static setZ(v, value) {
    v[2] = value;
    return v;
  }

  static copy(v, src) {
    for (let i = 0; i < 3; i++) {
      v[i] = src[i];
    }
    return v;
  }

  static length(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  }

  static normalize(v) {
    const length = Vector3.length(v);

    // @TODO: Error handling?
    if (length !== 0.0) {
      for (let i = 0; i < 3; i++) {
        v[i] /= length;
      }
    }

    return v;
  }
}

// XYZ order
export class Euler {
  static create() {
    return new Float32Array(3);
  }

  static set(e, x, y, z) {
    e[0] = x;
    e[1] = y;
    e[2] = z;
    return e;
  }

  static setX(e, value) {
    e[0] = value;
    return e;
  }

  static setY(e, value) {
    e[1] = value;
    return e;
  }

  static setZ(e, value) {
    e[2] = value;
    return e;
  }

  static add(e, e2) {
    for (let i = 0; i < 3; i++) {
      e[i] += e2[i];
    }
    return e;
  }
}

export class Quaternion {
  static create() {
    return Quaternion.set(new Float32Array(4), 0.0, 0.0, 0.0, 1.0);
  }

  static set(q, x, y, z, w) {
    q[0] = x;
    q[1] = y;
    q[2] = z;
    q[3] = w;
    return q;
  }

  static setFromEuler(q, e) {
    // Assume XYZ order
    const x = e[0];
    const y = e[1];
    const z = e[2];

    const c1 = Math.cos(x / 2.0);
    const c2 = Math.cos(y / 2.0);
    const c3 = Math.cos(z / 2.0);

    const s1 = Math.sin(x / 2.0);
    const s2 = Math.sin(y / 2.0);
    const s3 = Math.sin(z / 2.0);

    q[0] = s1 * c2 * c3 + c1 * s2 * s3;
    q[1] = c1 * s2 * c3 - s1 * c2 * s3;
    q[2] = c1 * c2 * s3 + s1 * s2 * c3;
    q[3] = c1 * c2 * c3 - s1 * s2 * s3;

    return q;
  }
}

export class Matrix3 {
  static create() {
    return Matrix4.makeIdentity(new Float32Array(9));
  }

  static makeIdentity(m) {
    m[0] = 1.0;
    m[1] = 0.0;
    m[2] = 0.0;

    m[3] = 0.0;
    m[4] = 1.0;
    m[5] = 0.0;

    m[6] = 0.0;
    m[7] = 0.0;
    m[8] = 1.0;

    return m;
  }

  static copy(m, src) {
    for (let i = 0; i < 9; i++) {
      m[i] = src[i];
    }
    return m;
  }

  static makeNormalFromMatrix4(m, src) {
    const a00 = src[0];
    const a01 = src[1];
    const a02 = src[2];
    const a03 = src[3];
    const a10 = src[4];
    const a11 = src[5];
    const a12 = src[6];
    const a13 = src[7];
    const a20 = src[8];
    const a21 = src[9];
    const a22 = src[10];
    const a23 = src[11];
    const a30 = src[12];
    const a31 = src[13];
    const a32 = src[14];
    const a33 = src[15];

    const b00 = a00 * a11 - a01 * a10;
    const b01 = a00 * a12 - a02 * a10;
    const b02 = a00 * a13 - a03 * a10;
    const b03 = a01 * a12 - a02 * a11;
    const b04 = a01 * a13 - a03 * a11;
    const b05 = a02 * a13 - a03 * a12;
    const b06 = a20 * a31 - a21 * a30;
    const b07 = a20 * a32 - a22 * a30;
    const b08 = a20 * a33 - a23 * a30;
    const b09 = a21 * a32 - a22 * a31;
    const b10 = a21 * a33 - a23 * a31;
    const b11 = a22 * a33 - a23 * a32;

    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (det === 0.0) {
      // @TODO: Error handling?
      return m;
    }

    det = 1.0 / det;
    m[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    m[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    m[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    m[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    m[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    m[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    m[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    m[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    m[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

    return m;
  }
}

export class Matrix3GPU {
  static create() {
    return Matrix3GPU.identity(new Float32Array(12));
  }

  static identity(m) {
    m[0] = 1.0;
    m[1] = 0.0;
    m[2] = 0.0;
    m[3] = 0.0;
    m[4] = 0.0;
    m[5] = 1.0;
    m[6] = 0.0;
    m[7] = 0.0;
    m[8] = 0.0;
    m[9] = 0.0;
    m[10] = 1.0;
    m[11] = 0.0;
    return m;
  }

  static copy(m, src) {
    for (let i = 0; i < 12; i++) {
      m[i] = src[i];
    }
    return m;
  }

  static copyFromMatrix3(m, src) {
    // @TODO: Use loop?
    m[0] = src[0];
    m[1] = src[1];
    m[2] = src[2];
    m[3] = 0.0;
    m[4] = src[3];
    m[5] = src[4];
    m[6] = src[5];
    m[7] = 0.0;
    m[8] = src[6];
    m[9] = src[7];
    m[10] = src[8];
    m[11] = 0.0;
    return m;
  }
}

export class Matrix4 {
  static create() {
    return Matrix4.makeIdentity(new Float32Array(16));
  }

  static makeIdentity(m) {
    m[0] = 1.0;
    m[1] = 0.0;
    m[2] = 0.0;
    m[3] = 0.0;

    m[4] = 0.0;
    m[5] = 1.0;
    m[6] = 0.0;
    m[7] = 0.0;

    m[8] = 0.0;
    m[9] = 0.0;
    m[10] = 1.0;
    m[11] = 0.0;

    m[12] = 0.0;
    m[13] = 0.0;
    m[14] = 0.0;
    m[15] = 1.0;

    return m;
  }

  static multiply(m, m1, m2) {
    const a00 = m1[0];
    const a01 = m1[1];
    const a02 = m1[2];
    const a03 = m1[3];
    const a10 = m1[4];
    const a11 = m1[5];
    const a12 = m1[6];
    const a13 = m1[7];
    const a20 = m1[8];
    const a21 = m1[9];
    const a22 = m1[10];
    const a23 = m1[11];
    const a30 = m1[12];
    const a31 = m1[13];
    const a32 = m1[14];
    const a33 = m1[15];

    let b0 = m2[0];
    let b1 = m2[1];
    let b2 = m2[2];
    let b3 = m2[3];
    m[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    m[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    m[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    m[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = m2[4];
    b1 = m2[5];
    b2 = m2[6];
    b3 = m2[7];
    m[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    m[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    m[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    m[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = m2[8];
    b1 = m2[9];
    b2 = m2[10];
    b3 = m2[11];
    m[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    m[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    m[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    m[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = m2[12];
    b1 = m2[13];
    b2 = m2[14];
    b3 = m2[15];
    m[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    m[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    m[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    m[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    return m;
  }

  static copy(m, src) {
    for (let i = 0; i < 16; i++) {
      m[i] = src[i];
    }
    return m;
  }

  static invert(m) {
    const a00 = m[0];
    const a01 = m[1];
    const a02 = m[2];
    const a03 = m[3];
    const a10 = m[4];
    const a11 = m[5];
    const a12 = m[6];
    const a13 = m[7];
    const a20 = m[8];
    const a21 = m[9];
    const a22 = m[10];
    const a23 = m[11];
    const a30 = m[12];
    const a31 = m[13];
    const a32 = m[14];
    const a33 = m[15];

    const b00 = a00 * a11 - a01 * a10;
    const b01 = a00 * a12 - a02 * a10;
    const b02 = a00 * a13 - a03 * a10;
    const b03 = a01 * a12 - a02 * a11;
    const b04 = a01 * a13 - a03 * a11;
    const b05 = a02 * a13 - a03 * a12;
    const b06 = a20 * a31 - a21 * a30;
    const b07 = a20 * a32 - a22 * a30;
    const b08 = a20 * a33 - a23 * a30;
    const b09 = a21 * a32 - a22 * a31;
    const b10 = a21 * a33 - a23 * a31;
    const b11 = a22 * a33 - a23 * a32;

    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (det == 0.0) {
    	// @TODO: Through error?
    	return m;
    }

    det = 1.0 / det;
    m[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    m[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    m[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    m[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    m[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    m[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    m[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    m[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    m[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    m[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    m[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    m[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    m[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    m[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    m[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    m[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return m;
  }

  static compose(m, position, quaternion, scale) {
    const x = quaternion[0];
    const y = quaternion[1];
    const z = quaternion[2];
    const w = quaternion[3];

    const x2 = x + x;
    const y2 = y + y;
    const z2 = z + z;

    const xx = x * x2;
    const xy = x * y2;
    const xz = x * z2;

    const yy = y * y2;
    const yz = y * z2;
    const zz = z * z2;

    const wx = w * x2;
    const wy = w * y2;
    const wz = w * z2;

    const sx = scale[0];
    const sy = scale[1];
    const sz = scale[2];

    m[0] = (1.0 - (yy + zz)) * sx;
    m[1] = (xy + wz) * sx;
    m[2] = (xz - wy) * sx;
    m[3] = 0.0;

    m[4] = (xy - wz) * sy;
    m[5] = (1.0 - (xx + zz)) * sy;
    m[6] = (yz + wx) * sy;
    m[7] = 0.0;

    m[8] = (xz + wy) * sz;
    m[9] = (yz - wx) * sz;
    m[10] = (1.0 - (xx + yy)) * sz;
    m[11] = 0.0;

    m[12] = position[0];
    m[13] = position[1];
    m[14] = position[2];
    m[15] = 1.0;

    return m;
  }

  static makePerspective(m, fovy, aspect, near, far) {
    const f = 1.0 / Math.tan(fovy / 2.0);
    m[0] = f / aspect;
    m[1] = 0.0;
    m[2] = 0.0;
    m[3] = 0.0;
    m[4] = 0.0;
    m[5] = f;
    m[6] = 0.0;
    m[7] = 0.0;
    m[8] = 0.0;
    m[9] = 0.0;
    m[11] = -1.0;
    m[12] = 0.0;
    m[13] = 0.0;
    m[15] = 0.0;

    const nf = 1.0 / (near - far);
    m[10] = far * nf;
    m[14] = far * near * nf;

    return m;
  }

  static makeOrthogonal(m, left, right, bottom, top, near, far) {
    const lr = 1.0 / (left - right);
    const bt = 1.0 / (bottom - top);
    const nf = 1.0 / (near - far);
    m[0] = -2.0 * lr;
    m[1] = 0.0;
    m[2] = 0.0;
    m[3] = 0.0;
    m[4] = 0.0;
    m[5] = -2.0 * bt;
    m[6] = 0.0;
    m[7] = 0.0;
    m[8] = 0.0;
    m[9] = 0.0;
    m[10] = nf;
    m[11] = 0.0;
    m[12] = (left + right) * lr;
    m[13] = (top + bottom) * bt;
    m[14] = near * nf;
    m[15] = 1.0;

    return m;
  }
}