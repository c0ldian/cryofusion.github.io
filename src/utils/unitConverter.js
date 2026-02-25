// 工具：数值四舍五入到指定位数
export function roundTo(value, digits) {
  if (value === null || value === undefined) return null
  const factor = Math.pow(10, digits)
  return Math.round(value * factor) / factor
}

// 角度转弧度
export function degToRad(deg) {
  return deg * Math.PI / 180
}

// 弧度转角度
export function radToDeg(rad) {
  return rad * 180 / Math.PI
}