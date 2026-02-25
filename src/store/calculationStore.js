import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import {
  transformSideCurrent,
  calculateDifferentialCurrent,
  calculateBrakingCurrent,
  checkOperatingCriteria,
  generateTestCurrents
} from '../calc/differentialEngine'
import { roundTo } from '../utils/unitConverter'

export const useCalculationStore = defineStore('calculation', () => {
  const settings = reactive({
    Id_min: '',
    I_break: '',
    k1: '',
    k2: '',
  })

  const errors = computed(() => {
    // 这个错误检查需要访问 transformer.params，但为了避免循环依赖，
    // 我们将错误检查移到页面中，或者传入 transformer 作为参数。
    // 暂时留空，由页面手动验证。
    return []
  })

  return {
    settings,
  }
})