/**
 * 差动保护校验计算引擎（完整版）
 * 基于专家手册：支持 YNd 组别补偿、Ir_mode、注入模式
 */

import { Complex } from './vectorMath.js'

// 本地工具：避免模块依赖问题
function roundTo(value, digits) {
  if (value === null || value === undefined) return null
  const factor = Math.pow(10, digits)
  return Math.round(value * factor) / factor
}
function radToDeg(rad) {
  return rad * (180 / Math.PI)
}

// ─── 复数运算辅助 ────────────────────────────────────────────────
function cpx(re, im = 0) {
  return new Complex(re, im)
}
function magnitude(z) {
  return z instanceof Complex ? z.abs() : 0
}
function phase(z) {
  return z instanceof Complex ? z.arg() : 0
}
function rotate(z, rad) {
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return new Complex(z.real * cos - z.imag * sin, z.real * sin + z.imag * cos)
}

// ───────────────────────────────────────────────────────────────────
// 1. 额定电流计算（二次侧）
export function calcRatedCurrents(Sn_MVA, UH_kV, UL_kV, nCTH, nCTL) {
  const Sn = Sn_MVA * 1e6
  const I_H_1st = Sn / (Math.sqrt(3) * UH_kV * 1e3)
  const I_L_1st = Sn / (Math.sqrt(3) * UL_kV * 1e3)
  const I_H_2nd = I_H_1st / nCTH
  const I_L_2nd = I_L_1st / nCTL
  return {
    I_H_2nd: roundTo(I_H_2nd, 4),
    I_L_2nd: roundTo(I_L_2nd, 4)
  }
}

// ───────────────────────────────────────────────────────────────────
// 2. 组别角差补偿矩阵
export function getCompensationMatrix(groupStr, compDir) {
  // 解析组别编号
  const m = String(groupStr).match(/(\d+)$/)
  const grp = m ? parseInt(m[1], 10) : 0
  const thetaLowLeads = grp * 30 * Math.PI / 180 // 低压侧超前高压侧的角度（弧度）

  // 补偿方向：H=对高压侧施加（角转星），L=对低压侧施加（星转角）
  if (compDir === 'H') {
    // 对高压侧（Y）补偿：旋转 -thetaLowLeads，并差接（1/√3）
    const angle = -thetaLowLeads
    const r = 1 / Math.sqrt(3)
    const re = r * Math.cos(angle)
    const im = r * Math.sin(angle)
    // M = r * e^{j*angle} * [ [1, -1, 0], [0, 1, -1], [-1, 0, 1] ] / ? 简化：这里使用标准三元素旋转
    // 为简化，采用专家手册中的结构：
    // M = (r e^{j*angle}) * [[1, -1, 0], [0, 1, -1], [-1, 0, 1]]
    const factor = new Complex(re, im)
    return [
      [factor, factor.multiply(new Complex(-1, 0)), new Complex(0, 0)],
      [new Complex(0, 0), factor, factor.multiply(new Complex(-1, 0))],
      [factor.multiply(new Complex(-1, 0)), new Complex(0, 0), factor]
    ]
  } else if (compDir === 'L') {
    // 对低压侧（Δ）补偿：旋转 +thetaLowLeads，并执行 Y<-Δ 变换
    const angle = thetaLowLeads
    const r = 1 / Math.sqrt(3)
    const re = r * Math.cos(angle)
    const im = r * Math.sin(angle)
    const factor = new Complex(re, im)
    // 星转角矩阵：从 Δ 到 Y 的逆变换，结构同上但角度不同
    return [
      [factor, factor.multiply(new Complex(-1, 0)), new Complex(0, 0)],
      [new Complex(0, 0), factor, factor.multiply(new Complex(-1, 0))],
      [factor.multiply(new Complex(-1, 0)), new Complex(0, 0), factor]
    ]
  } else {
    throw new Error('compDir must be H or L')
  }
}

// 应用补偿矩阵到三相电流向量
export function applyCompensation(Iabc, M) {
  const [IA, IB, IC] = Iabc
  const IA_c = M[0][0].multiply(IA).add(M[0][1].multiply(IB)).add(M[0][2].multiply(IC))
  const IB_c = M[1][0].multiply(IA).add(M[1][1].multiply(IB)).add(M[1][2].multiply(IC))
  const IC_c = M[2][0].multiply(IA).add(M[2][1].multiply(IB)).add(M[2][2].multiply(IC))
  return [IA_c, IB_c, IC_c]
}

function buildDiffRelayTesterPlan(points, injectMode, ctChannels, frequencyHz = 50) {
  return points.map((pt, idx) => {
    const inject = pt.inject
    const channels = [
      { number: 1, quantity: 'I', side: 'H-A', magnitude_A: inject.I_H_A.magnitude, angle_deg: inject.I_H_A.angle_deg },
      { number: 2, quantity: 'I', side: 'H-B', magnitude_A: inject.I_H_B.magnitude, angle_deg: inject.I_H_B.angle_deg },
      { number: 3, quantity: 'I', side: 'H-C', magnitude_A: inject.I_H_C.magnitude, angle_deg: inject.I_H_C.angle_deg },
      { number: 4, quantity: 'I', side: 'L-A', magnitude_A: inject.I_L_A.magnitude, angle_deg: inject.I_L_A.angle_deg },
      { number: 5, quantity: 'I', side: 'L-B', magnitude_A: inject.I_L_B.magnitude, angle_deg: inject.I_L_B.angle_deg },
      { number: 6, quantity: 'I', side: 'L-C', magnitude_A: inject.I_L_C.magnitude, angle_deg: inject.I_L_C.angle_deg }
    ].filter(ch => ctChannels === 6 || ch.number <= 3)

    return {
      step: idx + 1,
      name: `Ir=${pt.Ir_pu} pu 边界点`,
      expected: pt.expected,
      hold_time_s: 0.2,
      timeout_s: 1.0,
      frequency_hz: frequencyHz,
      inject_mode: injectMode,
      channels
    }
  })
}

// ───────────────────────────────────────────────────────────────────
// 3. 单相平衡接线注入计算
export function calcSinglePhaseInject(Ir_pu, Id_pu, I_H_rated, I_L_rated, side = 'H_fixed') {
  // 单相 A 相注入，B、C 为零
  // 差动：Id = |iH - iL|（穿越时异号）
  // 制动：Ir = (|iH| + |iL|) / 2  (avg mode)
  // 联立：
  //   iH = Ir + Id/2  (高压侧)
  //   iL = Ir - Id/2  (低压侧，穿越为正)
  const iH_pu = Ir_pu + Id_pu / 2
  const iL_pu = Ir_pu - Id_pu / 2

  const I_H_inject = Math.abs(iH_pu) * I_H_rated
  const I_L_inject = Math.abs(iL_pu) * I_L_rated

  return {
    I_H_A: { magnitude: roundTo(I_H_inject, 4), angle_deg: 0.0 },
    I_H_B: { magnitude: 0.0, angle_deg: 0.0 },
    I_H_C: { magnitude: 0.0, angle_deg: 0.0 },
    I_L_A: { magnitude: roundTo(I_L_inject, 4), angle_deg: 180.0 }, // 穿越，反向
    I_L_B: { magnitude: 0.0, angle_deg: 0.0 },
    I_L_C: { magnitude: 0.0, angle_deg: 0.0 }
  }
}

// ───────────────────────────────────────────────────────────────────
// 4. 三相平衡接线注入计算
export function calcThreePhaseInject(
  Ir_pu, Id_pu,
  I_H_rated, I_L_rated,
  groupStr, compDir,
  Ir_mode = 'avg'
) {
  // 对称三相注入，高压侧 A 相 0° 参考
  // iH = Ir + Id/2, iL = Ir - Id/2（穿越时 iL 符号相反）
  const iH_pu = Ir_pu + Id_pu / 2
  const iL_pu = Ir_pu - Id_pu / 2

  const I_H_amp = Math.abs(iH_pu) * I_H_rated
  const I_L_amp = Math.abs(iL_pu) * I_L_rated

  // 高压侧三相对称，A=0°, B=-120°, C=+120°
  const I_H_A = cpx(I_H_amp, 0)
  const I_H_B = rotate(I_H_A, (-2 * Math.PI / 3))
  const I_H_C = rotate(I_H_A, (2 * Math.PI / 3))

  // 组别角差（低压侧超前高压侧）
  const m = String(groupStr).match(/(\d+)$/)
  const grp = m ? parseInt(m[1], 10) : 0
  const thetaGroupDeg = grp * 30
  const thetaGroupRad = thetaGroupDeg * Math.PI / 180

  // 补偿矩阵：仅用于确定测试仪注入角度（补偿前原始值）
  // compDir='H'：高压侧施加补偿，低压侧直接注入，低压相对高压 180° 穿越
  // compDir='L'：低压侧施加补偿，测试仪注入低压侧需额外消除补偿角
  let offsetDeg = 180
  if (compDir === 'L') {
    offsetDeg = 180 - thetaGroupDeg
  }

  const offsetRad = offsetDeg * Math.PI / 180
  const I_L_A = rotate(cpx(I_L_amp, 0), offsetRad)
  const I_L_B = rotate(I_L_A, (-2 * Math.PI / 3))
  const I_L_C = rotate(I_L_A, (2 * Math.PI / 3))

  const fmt = (c) => ({
    magnitude: roundTo(magnitude(c), 4),
    angle_deg: roundTo(radToDeg(phase(c)), 2)
  })

  return {
    I_H_A: fmt(I_H_A),
    I_H_B: fmt(I_H_B),
    I_H_C: fmt(I_H_C),
    I_L_A: fmt(I_L_A),
    I_L_B: fmt(I_L_B),
    I_L_C: fmt(I_L_C)
  }
}

// ───────────────────────────────────────────────────────────────────
// 5. 动作边界计算
export function calcBoundaryId(Ir_pu, Id_min_pu, K1, K2, Ir_break_pu) {
  if (Ir_pu <= Ir_break_pu) {
    return Id_min_pu + K1 * Ir_pu
  } else {
    return Id_min_pu + K1 * Ir_break_pu + K2 * (Ir_pu - Ir_break_pu)
  }
}

// ───────────────────────────────────────────────────────────────────
// 6. 主函数：差动保护测试生成
export function calcDifferentialTest({
  // 主变参数
  Sn_MVA,
  UH_kV,
  UL_kV,
  groupStr,
  nCTH,
  nCTL,
  // 整定参数
  Id_min_pu,
  K1,
  K2,
  Ir_break_pu,
  Ir_mode = 'avg',
  compDir = 'H',
  // 测试配置
  injectMode = 'three_phase', // 'single_phase' | 'three_phase'
  testMode = 'sweep_slope',   // 'sweep_slope' | 'single_Ir' | 'min_Id' | 'through'
  Ir_scan_list,              // explicit list
  Ir_single,
  ctChannels = 6
}) {
  // 1. 计算额定二次电流
  const { I_H_2nd, I_L_2nd } = calcRatedCurrents(Sn_MVA, UH_kV, UL_kV, nCTH, nCTL)

  // 2. 生成扫描点（若未指定，自动生成）
  let IrList = Ir_scan_list
  if (!IrList || IrList.length === 0) {
    // 常用：0.5×I_break ~ 3×I_break，步长 0.5×I_break
    const I_break = Number(Ir_break_pu)
    if (Number.isFinite(I_break) && I_break > 0) {
      const start = roundTo(0.5 * I_break, 4)
      const end = roundTo(3 * I_break, 4)
      const step = roundTo(0.5 * I_break, 4)
      IrList = []
      for (let I = start; I <= end + 1e-9; I = roundTo(I + step, 4)) {
        if (!Number.isFinite(I)) break
        IrList.push(I)
      }
    } else {
      IrList = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0]
    }
  }

  // 3. 扫描/单点计算
  const curve = []
  const targetIrList = testMode === 'single_Ir' && Ir_single ? [Number(Ir_single)] : IrList

  for (const Ir_pu of targetIrList) {
    const Id_boundary = calcBoundaryId(Ir_pu, Number(Id_min_pu), Number(K1), Number(K2), Number(Ir_break_pu))

    // 根据注入模式计算注入量
    let inject
    if (injectMode === 'single_phase') {
      inject = calcSinglePhaseInject(Ir_pu, Id_boundary, I_H_2nd, I_L_2nd)
    } else {
      inject = calcThreePhaseInject(Ir_pu, Id_boundary, I_H_2nd, I_L_2nd, groupStr, compDir, Ir_mode)
    }

    curve.push({
      Ir_pu: roundTo(Ir_pu, 4),
      Id_boundary: roundTo(Id_boundary, 4),
      inject,
      expected: 'trip at boundary'
    })
  }

  // 4. 生成特性曲线数据（供绘图）
  const characteristic_curve = []
  for (let i = 0; i <= 30; i++) {
    const Ir = i / 10
    const Id_thr = calcBoundaryId(Ir, Number(Id_min_pu), Number(K1), Number(K2), Number(Ir_break_pu))
    characteristic_curve.push({ Ir: roundTo(Ir, 2), Id_threshold: roundTo(Id_thr, 4) })
  }

  // 5. 组别角差信息
  const m = String(groupStr).match(/(\d+)$/)
  const grp = m ? parseInt(m[1], 10) : 0
  const thetaGroupDeg = grp * 30

  return {
    // 基础量
    I_H_2nd_rated: I_H_2nd,
    I_L_2nd_rated: I_L_2nd,
    group: groupStr,
    comp_dir: compDir,
    inject_mode: injectMode,
    ct_channels: ctChannels,
    theta_group_deg: thetaGroupDeg,

    // 整定参数（回显）
    settings: {
      Id_min_pu: Number(Id_min_pu),
      K1: Number(K1),
      K2: Number(K2),
      Ir_break_pu: Number(Ir_break_pu),
      Ir_mode
    },

    // 测试点
    slope_test_points: curve,

    relay_tester_plan: buildDiffRelayTesterPlan(curve, injectMode, ctChannels),

    // 特性曲线
    characteristic_curve,

    // 接线指导
    wiring_guide: {
      ct_channels: ctChannels,
      method: ctChannels === 6 ? 'six_channel_full' : 'three_channel_single_side',
      H_terminal: '保护装置高压侧电流输入端子（IHA/IHB/IHC）',
      L_terminal: ctChannels === 6 ? '保护装置低压侧电流输入端子（ILA/ILB/ILC）' : '短接或悬空（根据装置TA断线逻辑）',
      polarity_note: '高压侧CT S1朝母线，低压侧CT S1朝变压器',
      phase_note: `低压侧电流超前高压侧 ${thetaGroupDeg}°（${groupStr} 组别），测试仪低压侧相角应偏移 180° ${compDir === 'L' ? '并补偿组别角' : ''}`,
      comp_note: `软件补偿施加在 ${compDir === 'H' ? '高压侧（角转星）' : '低压侧（星转角）'}，测试仪注入为补偿前原始值`
    }
  }
}
