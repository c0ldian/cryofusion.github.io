/**
 * 距离保护计算引擎
 * 基于序网络的相间短路 + 方向阻抗圆
 */

function round(x, n) {
  return Math.round(x * Math.pow(10, n)) / Math.pow(10, n)
}

class ComplexC {
  constructor(re = 0, im = 0) {
    this.re = re
    this.im = im
  }
  add(c) {
    return new ComplexC(this.re + c.re, this.im + c.im)
  }
  sub(c) {
    return new ComplexC(this.re - c.re, this.im - c.im)
  }
  multiply(c) {
    return new ComplexC(this.re * c.re - this.im * c.im, this.re * c.im + this.im * c.re)
  }
  divide(c) {
    const denom = c.re * c.re + c.im * c.im
    return new ComplexC(
      (this.re * c.re + this.im * c.im) / denom,
      (this.im * c.re - this.re * c.im) / denom
    )
  }
  negate() {
    return new ComplexC(-this.re, -this.im)
  }
  abs() {
    return Math.sqrt(this.re * this.re + this.im * this.im)
  }
  arg() {
    return Math.atan2(this.im, this.re)
  }
  rotate(rad) {
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    return new ComplexC(this.re * cos - this.im * sin, this.re * sin + this.im * cos)
  }
  static fromPolar(mag, rad) {
    return new ComplexC(mag * Math.cos(rad), mag * Math.sin(rad))
  }
}

function magnitude(z) {
  return z instanceof ComplexC ? z.abs() : Math.sqrt(z.re * z.re + z.im * z.im)
}
function phase(z) {
  return z instanceof ComplexC ? z.arg() : 0
}
function degrees(rad) {
  return rad * (180 / Math.PI)
}
function complex(re = 0, im = 0) {
  return new ComplexC(re, im)
}

/**
 * 相间短路（正序+负序）计算
 */
export function calcPhaseFault({
  Un_kV,
  nCT,
  nPT,
  R1_per_km,
  X1_per_km,
  RS,
  XS,
  d_km,
  Rf,
  fault_type,
  Zset_I,
  Zset_II,
  Zset_III,
  t_I,
  t_II,
  t_III
}) {
  const pi = Math.PI

  // 系统参数
  const E_ph = (Un_kV * 1000) / Math.sqrt(3)
  const Z_line = complex(R1_per_km, X1_per_km).multiply(new ComplexC(d_km, 0))
  const Z1 = new ComplexC(Z_line.re + Rf, Z_line.im) // 正序阻抗 + 故障电阻
  const ZS = complex(RS, XS)

  // 故障类型对应的参考相位
  const angleMap = { AB: 0, BC: -2 * pi / 3, CA: 2 * pi / 3 }
  const theta = angleMap[fault_type]

  // 故障点序电压（相量）
  const E_x = complex(Math.cos(theta) * E_ph, Math.sin(theta) * E_ph)
  const E_y = complex(Math.cos(theta - (2 * pi / 3)) * E_ph, Math.sin(theta - (2 * pi / 3)) * E_ph)

  // 正序+负序回路电流
  const Z_total = ZS.add(Z1)
  const I_x = E_x.sub(E_y).divide(Z_total.multiply(new ComplexC(2, 0)))
  const I_y = I_x.negate()
  const I_z = complex(0, 0)

  // 保护安装处电压
  const U_x = E_x.sub(I_x.multiply(ZS))
  const U_y = E_y.sub(I_y.multiply(ZS))
  const U_xy = U_x.sub(U_y) // 线电压

  // 二次折算
  const Uout = magnitude(U_xy) / nPT
  const Iout = magnitude(I_x) / nCT
  const phi_UI = degrees(phase(U_xy) - phase(I_x))

  // 测量阻抗（二次值模）
  const Zm_magnitude = Uout / Iout

  // 段别判断
  let zone = 'No trip'
  let t_action = null
  if (Zm_magnitude < Zset_I) {
    zone = 'I'
    t_action = t_I
  } else if (Zm_magnitude < Zset_II) {
    zone = 'II'
    t_action = t_II
  } else if (Zm_magnitude < Zset_III) {
    zone = 'III'
    t_action = t_III
  }

  // 各相二次值
  const U_A_mag = magnitude(U_x) / nPT
  const U_B_mag = magnitude(U_y) / nPT
  const U_C_mag = 0

  const I_A_mag = magnitude(I_x) / nCT
  const I_B_mag = magnitude(I_y) / nCT
  const I_C_mag = 0

  const phi_U_A = degrees(phase(U_x))
  const phi_U_B = degrees(phase(U_y))
  const phi_U_C = 0

  const phi_I_A = degrees(phase(I_x))
  const phi_I_B = degrees(phase(I_y))
  const phi_I_C = 0

  return {
    fault_type: fault_type,
    d_km: d_km,
    U_A_V: round(U_A_mag, 4),
    U_B_V: round(U_B_mag, 4),
    U_C_V: round(U_C_mag, 4),
    I_A_A: round(I_A_mag, 4),
    I_B_A: round(I_B_mag, 4),
    I_C_A: round(I_C_mag, 4),
    phi_U_A_deg: round(phi_U_A, 2),
    phi_U_B_deg: round(phi_U_B, 2),
    phi_U_C_deg: round(phi_U_C, 2),
    phi_I_A_deg: round(phi_I_A, 2),
    phi_I_B_deg: round(phi_I_B, 2),
    phi_I_C_deg: round(phi_I_C, 2),
    Zm_ohm: round(Zm_magnitude, 4),
    Zm_complex_re: 0,
    Zm_complex_im: 0,
    t_action_s: t_action,
    zone: zone
  }
}

/**
 * 方向距离校验（方向阻抗圆 + 角度窗口）
 */
export function calcDirectionalDistance({
  Un_kV,
  nCT,
  nPT,
  R1_per_km,
  X1_per_km,
  RS,
  XS,
  d_km,
  Rf,
  fault_type,
  Zset_ohm,
  theta_sens_deg,
  K_offset,
  t_set
}) {
  const pi = Math.PI

  // 复用相间计算，获取测量阻抗和二次量
  const baseResult = calcPhaseFault({
    Un_kV,
    nCT,
    nPT,
    R1_per_km,
    X1_per_km,
    RS,
    XS,
    d_km,
    Rf,
    fault_type: fault_type || 'AB',
    Zset_I: Zset_ohm,
    Zset_II: Infinity,
    Zset_III: Infinity,
    t_I: t_set,
    t_II: null,
    t_III: null
  })

  // 测量阻抗（一次值模）
  const Zm_magnitude = baseResult.Zm_ohm * (nPT / nCT)

  // 方向圆参数
  const theta_sens_rad = theta_sens_deg * pi / 180
  const Z0 = complex(
    K_offset * Zset_ohm * Math.cos(theta_sens_rad),
    K_offset * Zset_ohm * Math.sin(theta_sens_rad)
  )
  const Zm_vec = complex(Zm_magnitude, 0) // 简化：方向仅看角度，暂不计算完整复数
  const dist_to_center = magnitude(Zm_vec.sub(Z0))
  const in_circle = dist_to_center <= Zset_ohm

  // 角度窗口（简化：用已知的线路阻抗角近似 Zm 角度）
  // 实际上 Zm 角度 = φ_U - φ_I
  const Zm_angle_deg = baseResult.phi_U_A_deg - baseResult.phi_I_A_deg // 取A相近似
  let Zm_angle_rad = Zm_angle_deg * pi / 180
  let angle_diff = Zm_angle_rad - theta_sens_rad
  while (angle_diff > pi) angle_diff -= 2 * pi
  while (angle_diff < -pi) angle_diff += 2 * pi
  const in_angle_window = Math.abs(angle_diff) <= (pi / 2)

  const trip = in_circle && in_angle_window

  return {
    fault_type: fault_type,
    d_km: d_km,
    Zm_ohm: round(Zm_magnitude, 4),
    Zm_angle_deg: round(Zm_angle_deg, 2),
    Zset_ohm: round(Zset_ohm, 4),
    theta_sens_deg: round(theta_sens_deg, 2),
    K_offset: round(K_offset, 4),
    in_circle,
    in_angle_window,
    trip,
    t_action_s: trip ? t_set : null,
    zone: trip ? 'Trip' : 'No trip',
    // 输出二次量
    U_A_V: baseResult.U_A_V,
    U_B_V: baseResult.U_B_V,
    U_C_V: baseResult.U_C_V,
    I_A_A: baseResult.I_A_A,
    I_B_A: baseResult.I_B_A,
    I_C_A: baseResult.I_C_A,
    phi_U_A_deg: baseResult.phi_U_A_deg,
    phi_U_B_deg: baseResult.phi_U_B_deg,
    phi_U_C_deg: baseResult.phi_U_C_deg,
    phi_I_A_deg: baseResult.phi_I_A_deg,
    phi_I_B_deg: baseResult.phi_I_B_deg,
    phi_I_C_deg: baseResult.phi_I_C_deg,
  }
}

/**
 * 生成测试序列
 */
export function generatePhaseTestSequence(config, steps) {
  return steps.map(step => ({
    step,
    ...calcPhaseFault({ ...config, ...step })
  }))
}

export function generateDirectionalTestSequence(config, steps) {
  return steps.map(step => ({
    step,
    ...calcDirectionalDistance({ ...config, ...step })
  }))
}
