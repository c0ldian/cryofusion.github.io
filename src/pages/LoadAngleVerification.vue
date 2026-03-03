<template>
  <CalculatorLayout
    :model-value="formData"
    :title="'带负荷相角校验'"
    :description="'用于核对电压、电流相角关系、功率因数与三相对称性，快速输出现场校验结论。'"
    :sections="sections"
    :calculating="calculating"
    :can-calculate="canCalculate"
    :has-results="!!results"
    :result-items="resultItems"
    :additional-info="additionalInfo"
    :formulas="formulas"
    :errors="errors"
    @calculate="runCalculation"
    @reset="resetForm"
    @copy="copyResults"
  />
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import CalculatorLayout from '../design-system/components/CalculatorLayout.vue'

const defaultForm = {
  uaAngle: 0,
  ubAngle: -120,
  ucAngle: 120,
  iaAngle: -30,
  ibAngle: -150,
  icAngle: 90,
  expectedPf: 0.9,
  toleranceDeg: 15,
}

const formData = reactive({ ...defaultForm })
const calculating = ref(false)
const errors = ref([])
const results = ref(null)

const sections = [
  {
    title: '相角输入（单位：°）',
    fields: [
      { key: 'uaAngle', label: 'Ua 相角', step: 0.1, required: true },
      { key: 'ubAngle', label: 'Ub 相角', step: 0.1, required: true },
      { key: 'ucAngle', label: 'Uc 相角', step: 0.1, required: true },
      { key: 'iaAngle', label: 'Ia 相角', step: 0.1, required: true },
      { key: 'ibAngle', label: 'Ib 相角', step: 0.1, required: true },
      { key: 'icAngle', label: 'Ic 相角', step: 0.1, required: true },
    ],
  },
  {
    title: '校验参数',
    fields: [
      { key: 'expectedPf', label: '参考功率因数', step: 0.01, required: true, hint: '范围 0~1，例如 0.9' },
      { key: 'toleranceDeg', label: '相角容差', step: 0.1, suffix: '°', required: true, hint: '用于判断相角偏差是否合格' },
    ],
  },
]

const normalize = (angle) => {
  let a = angle % 360
  if (a > 180) a -= 360
  if (a <= -180) a += 360
  return a
}

const angleDiff = (a, b) => normalize(a - b)

const validate = () => {
  const errs = []
  for (const key of Object.keys(formData)) {
    if (formData[key] === '' || formData[key] === null || Number.isNaN(Number(formData[key]))) {
      errs.push(`参数 ${key} 不能为空`)
    }
  }
  if (formData.expectedPf < 0 || formData.expectedPf > 1) errs.push('参考功率因数需在 0~1 之间')
  if (formData.toleranceDeg <= 0 || formData.toleranceDeg > 60) errs.push('相角容差建议在 0~60° 之间')
  errors.value = errs
  return errs.length === 0
}

const canCalculate = computed(() => {
  return Object.values(formData).every(v => typeof v === 'number' && !Number.isNaN(v))
})

const resultItems = computed(() => {
  if (!results.value) return []
  const r = results.value
  return [
    { key: 'phiA', label: 'A相功角 φA', value: r.phiA, unit: '°', precision: 2, valueClass: 'text-cyan-300' },
    { key: 'phiB', label: 'B相功角 φB', value: r.phiB, unit: '°', precision: 2, valueClass: 'text-cyan-300' },
    { key: 'phiC', label: 'C相功角 φC', value: r.phiC, unit: '°', precision: 2, valueClass: 'text-cyan-300' },
    { key: 'pfAvg', label: '平均功率因数', value: r.pfAvg, precision: 3, valueClass: 'text-emerald-300' },
    { key: 'angleUnbalance', label: '三相角度不平衡', value: r.angleUnbalance, unit: '°', precision: 2, valueClass: 'text-amber-300' },
    { key: 'verdict', label: '校验结论', value: r.verdict, valueClass: r.pass ? 'text-emerald-300' : 'text-red-300' },
  ]
})

const additionalInfo = computed(() => {
  if (!results.value) return ''
  const r = results.value
  return `参考功率因数 ${formData.expectedPf.toFixed(2)}，等效目标功角 ${r.expectedPhi.toFixed(2)}°，允许偏差 ±${formData.toleranceDeg.toFixed(1)}°。`
})

const formulas = [
  { description: '相位差计算', equation: 'φ = θU - θI（归一化至 -180°~180°）' },
  { description: '功率因数估算', equation: 'cosφ = cos(|φ|)' },
  { description: '三相对称性', equation: 'ΔIab, ΔIbc, ΔIca 应接近 120°；最大偏差用于不平衡评估' },
]

const runCalculation = async () => {
  if (!validate()) return
  calculating.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 80))

    const phiA = angleDiff(formData.uaAngle, formData.iaAngle)
    const phiB = angleDiff(formData.ubAngle, formData.ibAngle)
    const phiC = angleDiff(formData.ucAngle, formData.icAngle)

    const pfA = Math.cos(Math.abs(phiA) * Math.PI / 180)
    const pfB = Math.cos(Math.abs(phiB) * Math.PI / 180)
    const pfC = Math.cos(Math.abs(phiC) * Math.PI / 180)
    const pfAvg = (pfA + pfB + pfC) / 3

    const iab = Math.abs(Math.abs(angleDiff(formData.iaAngle, formData.ibAngle)) - 120)
    const ibc = Math.abs(Math.abs(angleDiff(formData.ibAngle, formData.icAngle)) - 120)
    const ica = Math.abs(Math.abs(angleDiff(formData.icAngle, formData.iaAngle)) - 120)
    const angleUnbalance = Math.max(iab, ibc, ica)

    const expectedPhi = Math.acos(Math.min(1, Math.max(0, formData.expectedPf))) * 180 / Math.PI
    const phasePass = [phiA, phiB, phiC].every(phi => Math.abs(Math.abs(phi) - expectedPhi) <= formData.toleranceDeg)
    const balancePass = angleUnbalance <= formData.toleranceDeg
    const pass = phasePass && balancePass

    results.value = {
      phiA,
      phiB,
      phiC,
      pfAvg,
      angleUnbalance,
      expectedPhi,
      pass,
      verdict: pass ? '通过：相角关系与负荷方向基本正确' : '未通过：存在相角偏差或三相不平衡，请复核接线与极性'
    }
  } finally {
    calculating.value = false
  }
}

const resetForm = () => {
  Object.assign(formData, defaultForm)
  errors.value = []
  results.value = null
}

const copyResults = async () => {
  if (!results.value) return
  const r = results.value
  const text = [
    '【带负荷相角校验报告】',
    `A/B/C相功角：${r.phiA.toFixed(2)}° / ${r.phiB.toFixed(2)}° / ${r.phiC.toFixed(2)}°`,
    `平均功率因数：${r.pfAvg.toFixed(3)}`,
    `三相角度不平衡：${r.angleUnbalance.toFixed(2)}°`,
    `校验结论：${r.verdict}`,
  ].join('\n')
  await navigator.clipboard.writeText(text)
  alert('校验结果已复制')
}
</script>
