import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import { useTransformerStore } from './transformerStore'
import {
  transformSideCurrent,
  calculateDifferentialCurrent,
  calculateBrakingCurrent,
  checkOperatingCriteria,
  generateTestCurrents
} from '../calc/differentialEngine'
import { roundTo } from '../utils/unitConverter'

export const useCalculationStore = defineStore('calculation', () => {
  const transformer = useTransformerStore()

  const settings = reactive({
    Id_min: '',
    I_break: '',
    k1: '',
    k2: '',
  })

  const errors = computed(() => {
    const errs = []
    const { capacity, voltages, ctRatios } = transformer.params
    if (!capacity || capacity <= 0) errs.push('容量必须大于 0')
    if (!voltages.hv || voltages.hv <= 0) errs.push('高压侧电压必须大于 0')
    if (voltages.lv && voltages.lv <= 0) errs.push('低压侧电压必须大于 0')
    ;['hv', 'lv'].forEach(side => {
      const r = ctRatios[side]
      if (r) {
        const m = r.toString().match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/)
        if (!m) errs.push(`${side === 'hv' ? '高压' : '低压'}侧 CT 变比格式错误`)
        else if (Number(m[2]) === 0) errs.push(`${side === 'hv' ? '高压' : '低压'}侧 CT 二次侧不能为 0`)
      }
    })
    if (!settings.Id_min || settings.Id_min <= 0) errs.push('最小动作电流必须大于 0')
    if (!settings.I_break || settings.I_break <= 0) errs.push('拐点电流必须大于 0')
    if (!settings.k1 || settings.k1 <= 0) errs.push('制动系数 k1 必须大于 0')
    if (!settings.k2 || settings.k2 <= 0) errs.push('制动系数 k2 必须大于 0')
    return errs
  })

  const deviceFactor = computed(() => {
    return transformer.params.deviceConfig === 'delta-to-wye' ? 1 / Math.sqrt(3) : Math.sqrt(3)
  })

  const testCurrents = computed(() => {
    const Id_min = Number(settings.Id_min)
    const I_break = Number(settings.I_break)
    if (!Id_min || !I_break) return []
    return generateTestCurrents(Id_min, I_break)
  })

  const results = computed(() => {
    if (errors.value.length > 0) return null

    const Id_min = Number(settings.Id_min)
    const I_break = Number(settings.I_break)
    const k1 = Number(settings.k1)
    const k2 = Number(settings.k2)
    const factors = transformer.conversionFactors.value
    const devFactor = deviceFactor.value
    const p = transformer.params

    const currents = testCurrents.value
    if (currents.length === 0) return null

    const table = currents.map(I_test => {
      // 单侧加流：高压侧加 I_test，低压侧为 0
      const I_H = transformSideCurrent(I_test, factors.hv, p.windingConnection.hv === 'D', p.clockNumbers.hv, devFactor)
      const I_L = transformSideCurrent(0, factors.lv, p.windingConnection.lv === 'D', p.clockNumbers.lv, devFactor)

      const I_diff = calculateDifferentialCurrent(I_H, I_L)
      const I_res = calculateBrakingCurrent(I_H, I_L)
      const { operate, region } = checkOperatingCriteria(I_diff, I_res, Id_min, I_break, k1, k2)
      const Id_set = region === 1 ? roundTo(Id_min + k1 * I_res, 4) : roundTo(Id_min + k2 * (I_res - I_break), 4)

      return {
        Ires: I_test,
        I_diff,
        I_res,
        Id_set,
        operate,
        region,
      }
    })

    return {
      table,
      factors,
    }
  })

  return {
    settings,
    testCurrents,
    results,
    errors,
  }
})