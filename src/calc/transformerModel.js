// 两绕组主变模型（高压、低压）

export function calculateRatedCurrents(capacity, voltages) {
  // I_rated_primary = S / (√3 × U)
  const sqrt3 = Math.sqrt(3)
  const toCurrent = (U) => {
    if (!U || U === 0) return null
    return (capacity * 1000) / (sqrt3 * U)
  }
  return {
    hv: voltages.hv ? toCurrent(voltages.hv) : null,
    lv: voltages.lv ? toCurrent(voltages.lv) : null,
  }
}

export function calculateSecondaryCurrents(ratedPrimary, ctRatios) {
  // I_rated_secondary = I_rated_primary × (CT_secondary / CT_primary)
  const parseRatio = (s) => {
    if (!s) return null
    const m = s.toString().match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/)
    if (!m) return null
    return { primary: Number(m[1]), secondary: Number(m[2]) }
  }
  const getSecondary = (I_pri, ratioStr) => {
    const ratio = parseRatio(ratioStr)
    if (!ratio || !I_pri) return null
    return I_pri * (ratio.secondary / ratio.primary)
  }
  return {
    hv: getSecondary(ratedPrimary.hv, ctRatios.hv),
    lv: ratedPrimary.lv ? getSecondary(ratedPrimary.lv, ctRatios.lv) : null,
  }
}

export function calculateConversionFactors(secondaryCurrents) {
  // K_i = I_rated_secondary_HV / I_rated_secondary_i
  const base = secondaryCurrents.hv
  if (!base) return { hv: 1, lv: 1 }
  const toFactor = (I_sec) => (I_sec ? base / I_sec : 1)
  return {
    hv: 1,
    lv: toFactor(secondaryCurrents.lv),
  }
}