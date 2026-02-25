import { roundTo, radToDeg } from '../utils/unitConverter'
import { getPhaseShiftRad } from './ctModel'
import { Complex } from './vectorMath'

// 将一侧的一次电流变换到装置侧（二次侧）
// I_test: 一次侧测试电流（标量，A）
// K_factor: 该侧折算系数（从 store.conversionFactors 中获取）
// isDeltaWinding: 该侧变压器绕组是否为 D 接（影响相位差）
// clockNumber: 该侧时钟数（0-11）
// deviceFactor: 装置 CT 配置因子（三角转星或星转三角）
export function transformSideCurrent(I_test, K_factor, isDeltaWinding, clockNumber, deviceFactor) {
  if (I_test === null || I_test === undefined) return new Complex(0, 0)
  // 幅值：I_test × K_factor × (√3 if delta winding else 1) × deviceFactor
  let magnitude = I_test * K_factor
  if (isDeltaWinding) {
    magnitude = magnitude * Math.sqrt(3)
  }
  magnitude = magnitude * deviceFactor
  magnitude = roundTo(magnitude, 4)

  // 相位：根据 clockNumber 旋转
  const shiftRad = getPhaseShiftRad(clockNumber)
  const c = Complex.fromPolar(magnitude, 0)
  return c.rotate(radToDeg(shiftRad))
}

// 差流 I_diff = |I_H' + I_L'|  两绕组版本
export function calculateDifferentialCurrent(I_H, I_L) {
  const sum = I_H.add(I_L)
  return roundTo(sum.abs(), 4)
}

// 制动电流 I_res = (|I_H'| + |I_L'|) / 2
export function calculateBrakingCurrent(I_H, I_L) {
  const absSum = I_H.abs() + I_L.abs()
  return roundTo(absSum / 2, 4)
}

// 两段式折线判据
export function checkOperatingCriteria(I_diff, I_res, Id_min, I_break, k1, k2) {
  let operate = false
  let region = 1
  if (I_res < I_break) {
    operate = I_diff > Id_min + k1 * I_res
    region = 1
  } else {
    operate = I_diff > Id_min + k2 * (I_res - I_break)
    region = 2
  }
  return { operate, region }
}

// 生成测试电流序列
export function generateTestCurrents(Id_min, I_break) {
  const start = roundTo(0.5 * I_break, 4)
  const end = roundTo(3 * I_break, 4)
  const step = roundTo(0.5 * I_break, 4)
  const seq = []
  for (let I = start; I <= end + 1e-9; I += step) {
    seq.push(roundTo(I, 4))
  }
  return seq
}