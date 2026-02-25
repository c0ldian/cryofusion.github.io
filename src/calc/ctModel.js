// CT 接线类型与相位补偿

// CT 接线系数：Y 接时 I_line = √3 × I_phase；D 接时 I_line = I_phase
export function getCTConnectionFactor(connection) {
  // connection: 'Y' or 'D'
  return connection === 'D' ? 1 / Math.sqrt(3) : Math.sqrt(3)
}

// 相位偏移角度（度）：clock_number × 30°
export function getPhaseShiftDeg(clockNumber) {
  return clockNumber * 30
}

// 相位偏移弧度
export function getPhaseShiftRad(clockNumber) {
  return getPhaseShiftDeg(clockNumber) * Math.PI / 180
}