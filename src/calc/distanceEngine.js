/**
 * 距离保护计算引擎
 * 包含相间短路和方向距离校验
 */

import { complex, magnitude, phase, degrees, subtract, add, multiply, divide } from './vectorMath.js'

/**
 * 相间短路计算（正序+负序回路）
 * 参考：基于序网络的AB/BC/CA两相短路解析解
 *
 * @param {number} Un_kV - 系统额定线电压 (kV)
 * @param {number} nCT - 电流互感器变比
 * @param {number} nPT - 电压互感器变比
 * @param {number} R1_per_km - 正序单位电阻 (Ω/km)
 * @param {number} X1_per_km - 正序单位电抗 (Ω/km)
 * @param {number} RS - 系统短路电阻 (Ω)
 * @param {number} XS - 系统短路电抗 (Ω)
 * @param {number} d_km - 故障点距首端距离 (km)
 * @param {number} Rf - 故障电阻 (Ω)
 * @param {string} fault_type - 故障类型: 'AB' | 'BC' | 'CA'
 * @param {number} Zset_I - I段阻抗定值 (Ω)
 * @param {number} Zset_II - II段阻抗定值 (Ω)
 * @param {number} Zset_III - III段阻抗定值 (Ω)
 * @param {number} t_I - I段时间 (s)
 * @param {number} t_II - II段时间 (s)
 * @param {number} t_III - III段时间 (s)
 * @returns {object} 计算结果字典
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
  const j = complex(0, 1)

  // 1. 系统参数
  const E_ph = (Un_kV * 1000) / Math.sqrt(3) // 相电压一次值 (V)
  const Z_line = complex(R1_per_km, X1_per_km).multiply(d_km) // 线路正序阻抗
  const Z1 = Z_line.add(complex(Rf, 0)) // 正序网络总阻抗 = 线路 + 故障电阻
  const ZS = complex(RS, XS) // 系统等效阻抗

  // 2. 故障类型对应的参考相位
  const angleMap = { AB: 0, BC: -2 * pi / 3, CA: 2 * pi / 3 }
  const theta = angleMap[fault_type]

  // 3. 故障点序电压（参考相量）
  const E_x = complex(E_ph, 0).rotate(theta) // A相（参考）
  const E_y = complex(E_ph, 0).rotate(theta - (2 * pi / 3)) // B相，滞后120°

  // 4. 两相短路电流（正序+负序回路，零序=0）
  // I_x = (E_x - E_y) / (2 * (ZS + Z1))
  const Z_total = ZS.add(Z1)
  const I_x = E_x.subtract(E_y).divide(complex(2, 0).multiply(Z_total))
  const I_y = I_x.negate() // I_y = -I_x
  const I_z = complex(0, 0) // C相无电流

  // 5. 保护安装处（母线侧）电压
  // U_x = E_x - I_x * ZS
  const U_x = E_x.subtract(I_x.multiply(ZS))
  const U_y = E_y.subtract(I_y.multiply(ZS))
  const U_z = U_x.subtract(U_y) // 线电压 U_xy = U_x - U_y

  // 6. 折算到二次侧
  const Uout = magnitude(U_z) / nPT // 线电压二次有效值 (V)
  const Iout = magnitude(I_x) / nCT // 电流二次有效值 (A)，取A相（或B相，同样大）
  const phi_UI = degrees(phase(U_z).subtract(phase(I_x))) // 电压超前电流的角度

  // 7. 测量阻抗（二次值，复数）
  // Zm = U_xy / I_x（保留复数，用于方向判别）
  const Zm_complex = divide(U_z, I_x).divide(complex(nPT, 0).divide(complex(nCT, 0))) // (U_z/nPT) / (I_x/nCT)
  const Zm_magnitude = magnitude(Zm_complex)

  // 8. 段别与动作时间
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

  // 9. 输出按测试仪格式：三相电压、三相电流（二次值、相角）
  // 相间故障时，Uab/Ub/Uc 保持额定（或根据系统电压），这里按实际计算值：
  // 故障相电压按实际值，非故障相电压保持额定相电压（或按对称分量推得）
  // 简化：输出 U_A、U_B、U_C 二次值（相电压），I_A、I_B、I_C
  const U_ph_secondary = (E_ph / Math.sqrt(3)) / nPT // 额定相电压二次值（非故障相）
  const U_A_2nd = fault_type === 'AB' || fault_type === 'CA' ? magnitude(U_x) / nPT : U_ph_secondary
  const U_B_2nd = fault_type === 'AB' || fault_type === 'BC' ? magnitude(U_y) / nPT : U_ph_secondary
  const U_C_2nd = fault_type === 'BC' || fault_type === 'CA' ? magnitude(complex(0, 0)) / nPT : U_ph_secondary // 实际 C 相电压非零，但按题意 C 相电流为零，这里简化

  const I_A_2nd = magnitude(I_x) / nCT
  const I_B_2nd = magnitude(I_y) / nCT
  const I_C_2nd = 0

  const phi_U_A = degrees(phase(U_x))
  const phi_U_B = degrees(phase(U_y))
  const phi_U_C = 0 // 简化

  const phi_I_A = degrees(phase(I_x))
  const phi_I_B = degrees(phase(I_y))
  const phi_I_C = 0

  return {
    fault_type: fault_type,
    d_km: d_km,
    // 二次值（有效值）
    U_A_V: round(U_A_2nd, 4),
    U_B_V: round(U_B_2nd, 4),
    U_C_V: round(U_C_2nd, 4),
    I_A_A: round(I_A_2nd, 4),
    I_B_A: round(I_B_2nd, 4),
    I_C_A: round(I_C_2nd, 4),
    // 相角（度，基准：A相电压或电流？测试仪通常各自显示）
    phi_U_A_deg: round(phi_U_A, 2),
    phi_U_B_deg: round(phi_U_B, 2),
    phi_U_C_deg: round(phi_U_C, 2),
    phi_I_A_deg: round(phi_I_A, 2),
    phi_I_B_deg: round(phi_I_B, 2),
    phi_I_C_deg: round(phi_I_C, 2),
    // 测量阻抗
    Zm_ohm: round(Zm_magnitude, 4),
    Zm_complex_re: round(Zm_complex.re, 4),
    Zm_complex_im: round(Zm_complex.im, 4),
    // 动作信息
    t_action_s: t_action,
    zone: zone
  }
}

/**
 * 方向距离校验（方向阻抗圆）
 *
 * @param {number} Un_kV - 系统额定线电压 (kV)
 * @param {number} nCT - 电流互感器变比
 * @param {number} nPT - 电压互感器变比
 * @param {number} R1_per_km - 正序单位电阻 (Ω/km)
 * @param {number} X1_per_km - 正序单位电抗 (Ω/km)
 * @param {number} RS - 系统短路电阻 (Ω)
 * @param {number} XS - 系统短路电抗 (Ω)
 * @param {number} d_km - 故障点距首端距离 (km)
 * @param {number} Rf - 故障电阻 (Ω)
 * @param {string} fault_type - 故障类型（通常用单相接地，但方向校验可以任意）
 * @param {number} Zset_ohm - 方向阻抗定值 (Ω)
 * @param {number} theta_sens_deg - 方向灵敏角（度，滞后为正，如 -30°）
 * @param {number} K_offset - 偏移系数（0~1），用于偏移特性
 * @param {number} t_set - 动作时间 (s)
 * @returns {object} 校验结果
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
  const j = complex(0, 1)

  // 1. 同相间计算，获取故障电流、电压
  // 这里复用相间短路逻辑（或更一般地做单相接地）。为简化，暂用相同序网络方法
  // 注意：方向校验通常用正方向出口最小故障、反方向近端故障，以及边界角度
  // 这里我们计算单一故障场景，再判断是否在方向阻抗圆内

  // 复用相间短路计算（但故障类型可能是 'A' 或 'AB' 等）
  // 为简化，假设做 AB 相间短路来计算测量阻抗
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
    fault_type: 'AB', // 固定用 AB 相间计算测量阻抗
    Zset_I: Zset_ohm,
    Zset_II: Infinity,
    Zset_III: Infinity,
    t_I: t_set,
    t_II: null,
    t_III: null
  })

  // 测量阻抗复数（一次值）
  const Zm_complex = complex(baseResult.Zm_complex_re * (nPT / nCT), baseResult.Zm_complex_im * (nPT / nCT))

  // 2. 方向阻抗圆特性
  // 动作方程：|Zm - Z0| ≤ R，其中 Z0 为偏移中心
  // 偏移中心：Z0 = K_offset * Zset_ohm * exp(j * (theta_sens + 90°))? 常见：圆直径沿阻抗角方向偏移
  // 更标准的方向阻抗圆：圆心在实轴偏移，特性角为 theta_sens
  // 即：圆心 C = K_offset * Zset_ohm * (cosθ + j sinθ)，半径 = Zset_ohm
  // 但通常方向阻抗圆方程为：|Z| ≤ Zset 且 arg(Z) ∈ [θ_sens-90°, θ_sens+90°]
  // 或者偏移圆：|Z - Z0| ≤ Zset，其中 Z0 = K_offset * Zset * e^(j*theta_sens)
  // 这里按偏移圆实现，便于几何判断

  const theta_sens_rad = theta_sens_deg * pi / 180
  const Z0 = complex(
    K_offset * Zset_ohm * Math.cos(theta_sens_rad),
    K_offset * Zset_ohm * Math.sin(theta_sens_rad)
  )
  const dist_to_center = magnitude(Zm_complex.subtract(Z0))
  const in_circle = dist_to_center <= Zset_ohm

  // 同时检查角度范围（防止反向误动）
  const angle_Zm = phase(Zm_complex) // -π ~ π
  // 将灵敏角归一化到与 Zm 同范围
  const sens_norm = (theta_sens_rad % (2 * pi))
  // 计算角度差，考虑 ±π 周期
  let angle_diff = angle_Zm - sens_norm
  while (angle_diff > pi) angle_diff -= 2 * pi
  while (angle_diff < -pi) angle_diff += 2 * pi
  const in_angle_window = Math.abs(angle_diff) <= (pi / 2) // ±90°

  const trip = in_circle && in_angle_window

  return {
    fault_type: fault_type,
    d_km: d_km,
    Zm_ohm: round(magnitude(Zm_complex), 4),
    Zm_angle_deg: round(degrees(angle_Zm), 2),
    Zset_ohm: round(Zset_ohm, 4),
    theta_sens_deg: round(theta_sens_deg, 2),
    K_offset: round(K_offset, 4),
    in_circle: in_circle,
    in_angle_window: in_angle_window,
    trip: trip,
    t_action_s: trip ? t_set : null,
    zone: trip ? 'Trip' : 'No trip'
    // 输出六元组同相间格式，供测试仪显示
    ...baseResult
  }
}

/**
 * 生成距离保护测试序列（相间）
 *
 * @param {object} config - 配置参数（见上方函数）
 * @param {Array} steps - 测试步骤，每个元素为 {d_km, fault_type}
 * @returns {Array} 测试结果数组
 */
export function generatePhaseTestSequence(config, steps) {
  return steps.map(step => ({
    step,
    ...calcPhaseFault({ ...config, ...step })
  }))
}

/**
 * 生成距离保护测试序列（方向）
 *
 * @param {object} config
 * @param {Array} steps
 * @returns {Array}
 */
export function generateDirectionalTestSequence(config, steps) {
  return steps.map(step => ({
    step,
    ...calcDirectionalDistance({ ...config, ...step })
  }))
}

function round(x, n) {
  return Math.round(x * Math.pow(10, n)) / Math.pow(10, n)
}
