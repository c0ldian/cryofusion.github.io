<template>
  <CalculatorLayout
    :model-value="formData"
    :title="'主变短路试验计算'"
    :description="'计算主变短路试验时的电流、电压值'"
    :sections="sections"
    :calculating="calculating"
    :canCalculate="canCalculate"
    :has-results="!!results"
    :result-items="resultItems"
    :additional-info="additionalInfo"
    :formulas="formulas"
    :errors="errors"
    :show-back="false"
    @calculate="runCalculation"
    @reset="resetForm"
    @copy="copyResults"
  />
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Card, Input, Select, Button, Badge, Alert } from '../design-system'
import CalculatorLayout from '../design-system/components/CalculatorLayout.vue'

const router = useRouter()

// Form data model
const formData = reactive({
  // Transformer params
  Sn_MVA: 50,
  UH_kV: 110,
  UL_kV: 10.5,
  nCTH_str: '600/5',
  nCTL_str: '4000/5',
  nPT_str: '1000/100',
  // Test settings
  zk_percent: 13.92,
  testVoltage_kV: 3.0
})

const calculating = ref(false)
const results = ref(null)
const errors = ref([])

// Layout sections configuration - centralized for easier management
const sections = [
  {
    title: '主变参数',
    fields: [
      { key: 'Sn_MVA', label: '容量', type: 'number', placeholder: '如 50', suffix: 'MVA', required: true, step: 0.1 },
      { key: 'UH_kV', label: '高压侧额定电压', type: 'number', placeholder: '如 110', suffix: 'kV', required: true, step: 0.1 },
      { key: 'UL_kV', label: '低压侧额定电压', type: 'number', placeholder: '如 10.5', suffix: 'kV', required: true, step: 0.1 },
      { key: 'nCTH_str', label: '高压侧 CT 变比', type: 'text', placeholder: '如 600/5', hint: '一次/二次，如 600/5', required: true },
      { key: 'nCTL_str', label: '低压侧 CT 变比', type: 'text', placeholder: '如 4000/5', hint: '一次/二次，如 4000/5', required: true },
      { key: 'nPT_str', label: 'PT 变比', type: 'text', placeholder: '如 1000/100', hint: '一次/二次', required: true }
    ]
  },
  {
    title: '短路试验设置',
    fields: [
      { key: 'zk_percent', label: '短路阻抗', type: 'number', placeholder: '如 13.92', suffix: '%', required: true, step: 0.01, hint: '铭牌短路阻抗百分比' },
      { key: 'testVoltage_kV', label: '试验电压（一次）', type: 'number', placeholder: '如 3', suffix: 'kV', required: true, step: 0.1, hint: '高压侧通入的一次电压' }
    ]
  }
]

// Utility functions
const parseCTRatio = (str) => {
  if (!str) return null
  const m = String(str).trim().match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/)
  if (!m) return null
  return parseFloat(m[1]) / parseFloat(m[2])
}

const roundTo = (value, digits) => {
  if (value === null || value === undefined || isNaN(value)) return null
  const factor = Math.pow(10, digits)
  return Math.round(value * factor) / factor
}

// Validation
const validate = () => {
  const errs = []
  if (!formData.Sn_MVA || formData.Sn_MVA <= 0) errs.push('容量必须大于 0')
  if (!formData.UH_kV || formData.UH_kV <= 0) errs.push('高压侧电压必须大于 0')
  if (!formData.UL_kV || formData.UL_kV <= 0) errs.push('低压侧电压必须大于 0')
  const nCTH = parseCTRatio(formData.nCTH_str)
  const nCTL = parseCTRatio(formData.nCTL_str)
  const nPT = parseCTRatio(formData.nPT_str)
  if (!nCTH) errs.push('高压侧 CT 变比格式错误（示例：600/5）')
  if (!nCTL) errs.push('低压侧 CT 变比格式错误（示例：4000/5）')
  if (!nPT) errs.push('PT 变比格式错误（示例：1000/100）')
  if (!formData.zk_percent || formData.zk_percent <= 0) errs.push('短路阻抗必须大于 0')
  if (!formData.testVoltage_kV || formData.testVoltage_kV <= 0) errs.push('试验电压必须大于 0')
  errors.value = errs
  return errs.length === 0
}

// Computed
const canCalculate = computed(() => {
  const required = ['Sn_MVA', 'UH_kV', 'UL_kV', 'nCTH_str', 'nCTL_str', 'nPT_str', 'zk_percent', 'testVoltage_kV']
  return required.every(key => {
    const val = formData[key]
    if (typeof val === 'number') return val > 0
    if (typeof val === 'string') return val.trim() !== ''
    return false
  })
})

// Result items for display
const resultItems = computed(() => {
  if (!results.value) return []
  const r = results.value
  return [
    { key: 'I_H_1st_rated', label: '高压侧一次额定电流', value: r.I_H_1st_rated, unit: 'A', precision: 2, valueClass: 'text-green-400' },
    { key: 'I_L_1st_rated', label: '低压侧一次额定电流', value: r.I_L_1st_rated, unit: 'A', precision: 2, valueClass: 'text-green-400' },
    { key: 'I_H_test_1st', label: '试验高压侧一次电流', value: r.I_H_test_1st, unit: 'A', precision: 4, valueClass: 'text-blue-400' },
    { key: 'I_H_test_2nd', label: '试验高压侧二次电流', value: r.I_H_test_2nd, unit: 'A', precision: 4, valueClass: 'text-blue-400' },
    { key: 'U_H_test_2nd', label: '试验高压侧二次电压', value: r.U_H_test_2nd, unit: 'V', precision: 1, valueClass: 'text-blue-400' },
    { key: 'I_L_test_1st', label: '试验低压侧一次电流', value: r.I_L_test_1st, unit: 'A', precision: 4, valueClass: 'text-blue-400' },
    { key: 'I_L_test_2nd', label: '试验低压侧二次电流', value: r.I_L_test_2nd, unit: 'A', precision: 4, valueClass: 'text-blue-400' }
  ]
})

// Additional info based on results
const additionalInfo = computed(() => {
  if (!results.value) return ''
  const r = results.value
  return `保护电压二次值：${r.U_H_test_2nd.toFixed(1)}V（线电压）`
})

// Formulas
const formulas = [
  {
    description: '高压侧一次额定电流',
    equation: 'I_H_rated = S / (√3 × U_H)'
  },
  {
    description: '短路阻抗标幺值',
    equation: 'Z_k(p.u.) = 短路阻抗% / 100'
  },
  {
    description: '试验高压侧一次电流',
    equation: 'I_H_test_1st = I_H_rated / Z_k × (U_test / U_H)'
  },
  {
    description: '试验高压侧二次电流',
    equation: 'I_H_test_2nd = I_H_test_1st ÷ n_CT_H'
  },
  {
    description: '高压侧二次电压',
    equation: 'U_H_test_2nd = U_test ÷ n_PT'
  },
  {
    description: '试验低压侧一次电流（电压变比换算）',
    equation: 'I_L_test_1st = I_H_test_1st × (U_H / U_L)'
  },
  {
    description: '试验低压侧二次电流',
    equation: 'I_L_test_2nd = I_L_test_1st ÷ n_CT_L'
  }
]

// Calculations
const runCalculation = async () => {
  if (!validate()) return

  calculating.value = true
  try {
    // Simulate async for smoother UX
    await new Promise(resolve => setTimeout(resolve, 100))

    const nCTH = parseCTRatio(formData.nCTH_str)
    const nCTL = parseCTRatio(formData.nCTL_str)
    const nPT = parseCTRatio(formData.nPT_str)

    // 1. 高压侧一次额定电流 I_H_rated = S / (√3 × U_H)
    const Sn = formData.Sn_MVA * 1e6
    const I_H_1st_rated = Sn / (Math.sqrt(3) * formData.UH_kV * 1e3)

    // 2. 短路阻抗标幺值
    const Zk_pu = formData.zk_percent / 100

    // 3. 试验电压为一次电压（kV），转为 V
    const U_test_1st = formData.testVoltage_kV * 1e3
    const U_H_1st_rated = formData.UH_kV * 1e3

    // 4. 试验时高压侧一次电流
    const I_H_test_1st = I_H_1st_rated / Zk_pu * (U_test_1st / U_H_1st_rated)

    // 5. 高压侧二次试验电流
    const I_H_test_2nd = I_H_test_1st / nCTH

    // 6. 保护装置感受到的二次电压（线电压）
    const U_H_test_2nd = U_test_1st / nPT

    // 7. 低压侧一次试验电流（通过电压变比换算）
    const ratio_voltage = formData.UH_kV / formData.UL_kV
    const I_L_test_1st = I_H_test_1st * ratio_voltage

    // 8. 低压侧二次试验电流
    const I_L_test_2nd = I_L_test_1st / nCTL

    // 9. 低压侧一次额定电流（参考）
    const I_L_1st_rated = Sn / (Math.sqrt(3) * formData.UL_kV * 1e3)

    results.value = {
      I_H_1st_rated: roundTo(I_H_1st_rated, 4),
      I_L_1st_rated: roundTo(I_L_1st_rated, 4),
      I_H_test_1st: roundTo(I_H_test_1st, 4),
      I_H_test_2nd: roundTo(I_H_test_2nd, 4),
      U_H_test_2nd: roundTo(U_H_test_2nd, 4),
      I_L_test_1st: roundTo(I_L_test_1st, 4),
      I_L_test_2nd: roundTo(I_L_test_2nd, 4),
      Zk_percent: formData.zk_percent,
      testVoltage_kV: formData.testVoltage_kV
    }
  } finally {
    calculating.value = false
  }
}

// Reset
const resetForm = () => {
  Object.assign(formData, {
    Sn_MVA: 50,
    UH_kV: 110,
    UL_kV: 10.5,
    nCTH_str: '600/5',
    nCTL_str: '4000/5',
    nPT_str: '1000/100',
    zk_percent: 13.92,
    testVoltage_kV: 3.0
  })
  results.value = null
  errors.value = []
}

// Copy
const copyResults = () => {
  if (!results.value) return
  const r = results.value
  const lines = [
    '【主变短路试验方案】',
    `主变：${formData.Sn_MVA} MVA, ${formData.UH_kV}kV/${formData.UL_kV}kV`,
    `CT变比：高压 ${formData.nCTH_str}，低压 ${formData.nCTL_str}`,
    `PT变比：${formData.nPT_str}`,
    `短路阻抗：${formData.zk_percent}%`,
    `试验电压：${formData.testVoltage_kV} kV（高压侧一次）`,
    '',
    '计算结果：',
    `- 高压侧一次额定电流：${r.I_H_1st_rated.toFixed(2)} A`,
    `- 低压侧一次额定电流：${r.I_L_1st_rated.toFixed(2)} A`,
    `- 试验高压侧一次电流：${r.I_H_test_1st.toFixed(4)} A`,
    `- 试验高压侧二次电流：${r.I_H_test_2nd.toFixed(4)} A`,
    `- 保护电压二次值：${r.U_H_test_2nd.toFixed(1)} V（线电压）`,
    `- 试验低压侧一次电流：${r.I_L_test_1st.toFixed(4)} A`,
    `- 试验低压侧二次电流：${r.I_L_test_2nd.toFixed(4)} A`,
    '',
    '试验接线与注意事项：',
    '- 高压侧通入一次电压，保证保护装置感受到二次电压在额定范围内',
    '- 主变中性点闸刀分开',
    '- 低压侧短接（可通过套管 CT 二次短接）',
    '- 试验时监测各侧电流，确保不超过 CT 和绕组承受能力'
  ]
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    alert('已复制到剪贴板')
  }).catch(() => alert('复制失败'))
}
</script>
