// 生成比率制动特性曲线数据（用于 ECharts 展示）

export function generateCharacteristicCurve(Id_min, I_break, k1, k2, I_res_max = null) {
  if (!I_res_max) {
    I_res_max = Math.max(10, I_break * 3)
  }
  const points = []
  const steps = 50
  for (let i = 0; i <= steps; i++) {
    const I_res = i * I_res_max / steps
    let Id_set
    if (I_res < I_break) {
      Id_set = Id_min + k1 * I_res
    } else {
      Id_set = Id_min + k2 * (I_res - I_break)
    }
    points.push({ I_res, Id_set })
  }
  return points
}