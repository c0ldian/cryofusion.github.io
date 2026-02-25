// Complex 类，支持复数运算

export class Complex {
  constructor(real = 0, imag = 0) {
    this.real = real
    this.imag = imag
  }

  add(other) {
    return new Complex(this.real + other.real, this.imag + other.imag)
  }

  multiply(other) {
    // (a+jb)*(c+jd) = (ac-bd) + j(ad+bc)
    const r = this.real * other.real - this.imag * other.imag
    const i = this.real * other.imag + this.imag * other.real
    return new Complex(r, i)
  }

  abs() {
    return Math.sqrt(this.real * this.real + this.imag * this.imag)
  }

  // 旋转 deg 角度（顺时针为正）
  rotate(deg) {
    const rad = deg * Math.PI / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const r = this.real * cos - this.imag * sin
    const i = this.real * sin + this.imag * cos
    return new Complex(r, i)
  }

  static fromPolar(magnitude, angleDeg) {
    const rad = angleDeg * Math.PI / 180
    return new Complex(magnitude * Math.cos(rad), magnitude * Math.sin(rad))
  }
}