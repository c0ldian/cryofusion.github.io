function parseCTRatio(str) {
  if (!str) return null
  const parts = str.split('/')
  if (parts.length !== 2) return null
  const primary = Number(parts[0])
  const secondary = Number(parts[1])
  if (!primary || !secondary || secondary === 0) return null
  return primary / secondary
}

function roundTo(num, decimals) {
  const factor = Math.pow(10, decimals)
  return Math.round(num * factor) / factor
}

export function generateBalancePlan(capacity, voltages, ctRatios, windingConnection, deviceConfig) {
  const S = capacity * 1e6
  const sqrt3 = Math.sqrt(3)
  const I_pri_H = (S / sqrt3) / (voltages.hv * 1000)
  const I_pri_L = (S / sqrt3) / (voltages.lv * 1000)
  const ratioHV = parseCTRatio(ctRatios.hv)
  const ratioLV = parseCTRatio(ctRatios.lv)
  if (!ratioHV || !ratioLV) return null
  const secH = I_pri_H / ratioHV
  const secL = I_pri_L / ratioLV

  const K_delta_to_wye = 1 / Math.sqrt(3)
  const K_wye_to_delta = Math.sqrt(3)
  const K_H = deviceConfig === 'delta-to-wye' ? K_delta_to_wye : K_wye_to_delta
  const K_L = deviceConfig === 'delta-to-wye' ? K_wye_to_delta : K_delta_to_wye
  const I_H_proc = secH * K_H
  const I_L_proc = secL * K_L
  const Kb = I_H_proc / I_L_proc

  const I_H = roundTo(secH, 4)
  const I_L = roundTo(I_H * Kb, 4)

  const instructions = {
    channels: [
      { number: 1, phase: '高压侧 A 相', magnitude: I_H, phaseAngle: 0, frequency: 50 },
      { number: 2, phase: '高压侧 B 相', magnitude: I_H, phaseAngle: 120, frequency: 50 },
      { number: 3, phase: '低压侧 C 相', magnitude: I_L, phaseAngle: -30, frequency: 50 }
    ],
    wiring: `
## 通平衡接线方案

### 1. 调试台通道设置
| 通道 | 位置 | 电流 (A) | 相位 (°) | 频率 |
|------|------|----------|----------|------|
| 1 | 高压侧 A 相 | ${I_H} | 0 | 50 Hz |
| 2 | 高压侧 B 相 | ${I_H} | 120 | 50 Hz |
| 3 | 低压侧 C 相 | ${I_L} | -30 | 50 Hz |

### 2. 物理接线
- **高压侧（Y）**
  - A 相端子 ← 通道1
  - B 相端子 ← 通道2
  - C 相端子 悬空
- **低压侧（D）**
  - C 相端子 ← 通道3
  - A、B 相端子 悬空

### 3. 操作步骤
1. 退出差动保护出口压板
2. 按上表设置调试台三路输出
3. 同时输出，观察装置差流 Id
4. 调整装置平衡系数 Kb 使 Id < 0.02In

### 4. 原理
- 高压侧 A、B 两相电流在保护内部 Y→Δ 变换后合成
- 低压侧 C 相电流直接输入
- Yd11 固有 30° 相位差，通过设置通道3相位 -30° 抵消
- 幅值满足 I_L = I_H × Kb 时差流为零
`,
    notes: [
      '相位角设置取决于调试台坐标系，若差流偏大可尝试将通道2相位改为 -120°',
      'Kb 为理论值，现场应微调',
      '确保所有 CT 极性指向母线'
    ]
  }

  return {
    balanceFactor: roundTo(Kb, 4),
    instructions: instructions
  }
}