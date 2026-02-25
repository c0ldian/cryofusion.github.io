import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import { roundTo } from '../utils/unitConverter'
import {
  calculateRatedCurrents,
  calculateSecondaryCurrents,
  calculateConversionFactors
} from '../calc/transformerModel'

export const useTransformerStore = defineStore('transformer', () => {
  const params = reactive({
    capacity: '',
    voltages: { hv: '', lv: '' },
    windingConnection: { hv: 'Y', lv: 'Y' },
    clockNumbers: { hv: 0, lv: 0 },
    ctRatios: { hv: '', lv: '' },
    deviceConfig: 'delta-to-wye',
  })

  const ratedCurrentsPrimary = computed(() => {
    const { capacity, voltages } = params
    if (!capacity || !voltages.hv || !voltages.lv) return { hv: null, lv: null }
    const currents = calculateRatedCurrents(capacity, voltages.hv, voltages.lv)
    return {
      hv: currents.hv,
      lv: currents.lv,
    }
  })

  const ratedCurrentsSecondary = computed(() => {
    const pri = ratedCurrentsPrimary.value
    if (!pri.hv || !pri.lv) return { hv: null, lv: null }
    const sec = calculateSecondaryCurrents(pri, params.ctRatios)
    return {
      hv: sec.hv !== null ? roundTo(sec.hv, 4) : null,
      lv: sec.lv !== null ? roundTo(sec.lv, 4) : null,
    }
  })

  const conversionFactors = computed(() => {
    const sec = ratedCurrentsSecondary.value
    if (!sec.hv) return { hv: 1, lv: 1 }
    const factors = calculateConversionFactors(sec)
    return {
      hv: 1,
      lv: roundTo(factors.lv, 4),
    }
  })

  const deviceFactor = computed(() =>
    params.deviceConfig === 'delta-to-wye' ? 1 / Math.sqrt(3) : Math.sqrt(3)
  )

  return {
    params,
    ratedCurrentsPrimary,
    ratedCurrentsSecondary,
    conversionFactors,
    deviceFactor,
  }
})