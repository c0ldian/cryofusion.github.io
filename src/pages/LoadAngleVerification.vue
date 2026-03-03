<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-text-primary">带负荷试验相角校验工具</h1>
        <p class="text-text-secondary mt-1">按 PRD 提供实测录入、参考相量对比、异常提示与试验记录复制。</p>
      </div>
      <Button variant="ghost" size="sm" @click="$router.push('/')">返回主页</Button>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <Card title="基础参数" class="xl:col-span-1">
        <div class="space-y-4">
          <Input v-model="form.stationName" label="变电站名称" placeholder="可选" />
          <Input v-model="form.testDate" type="date" label="试验日期" />
          <Select v-model="form.voltageLevel" label="电压等级" :options="voltageOptions" />
          <div class="grid grid-cols-2 gap-3">
            <Input v-model="form.ptPrimary" type="number" label="PT一次" suffix="V" />
            <Input v-model="form.ptSecondary" type="number" label="PT二次" suffix="V" />
            <Input v-model="form.ctPrimary" type="number" label="CT一次" suffix="A" />
            <Input v-model="form.ctSecondary" type="number" label="CT二次" suffix="A" />
          </div>
          <Select v-model="form.deviceType" label="装置类型" :options="deviceOptions" />
          <Select v-model="form.runMode" label="潮流/运行方式" :options="runModeOptions" />
          <Select v-model="form.clampDirection" label="钳表方向" :options="clampOptions" />
          <div class="grid grid-cols-2 gap-3">
            <Input v-model="form.angleTolerance" type="number" label="角度容限" suffix="°" />
            <Input v-model="form.ampTolerance" type="number" label="幅值容限" suffix="%" />
          </div>
        </div>
      </Card>

      <Card title="实测三相数据（二次值）" class="xl:col-span-2">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="ph in phases" :key="ph" class="rounded-xl border border-border p-4 bg-surfaceHighlight/30 space-y-3">
            <h3 class="font-semibold text-text-primary">{{ ph }} 相</h3>
            <Input v-model="form[`U${ph}Amp`]" type="number" :label="`U${ph}`" suffix="V" />
            <Input v-model="form[`U${ph}Ang`]" type="number" :label="`φU${ph}`" suffix="°" />
            <Input v-model="form[`I${ph}Amp`]" type="number" :label="`I${ph}`" suffix="A" />
            <Input v-model="form[`I${ph}Ang`]" type="number" :label="`φI${ph}`" suffix="°" />
          </div>
        </div>
        <div class="mt-4 flex flex-wrap gap-3">
          <Button :disabled="!canRun" @click="runCompare">立即对比</Button>
          <Button variant="secondary" @click="resetForm">一键清除</Button>
          <Button variant="secondary" :disabled="!result" @click="copyReport">复制试验记录</Button>
        </div>
      </Card>
    </div>

    <Alert v-if="errors.length" variant="error">
      <ul class="list-disc pl-5 space-y-1">
        <li v-for="err in errors" :key="err">{{ err }}</li>
      </ul>
    </Alert>

    <Alert v-if="warnings.length" variant="warning">
      <ul class="list-disc pl-5 space-y-1">
        <li v-for="w in warnings" :key="w">{{ w }}</li>
      </ul>
    </Alert>

    <div v-if="result" class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <Card title="实测相量图（SVG）">
        <PhasorSvg :vectors="measuredVectors" />
      </Card>
      <Card title="参考相量图（SVG）">
        <PhasorSvg :vectors="referenceVectors" />
      </Card>

      <Card title="对比结果" class="xl:col-span-2">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div v-for="r in result.phaseResults" :key="r.phase" class="rounded-lg p-3 border" :class="r.currentAngleOK ? 'border-green-500/40 bg-green-500/10' : 'border-red-500/40 bg-red-500/10'">
            <p class="font-semibold">{{ r.phase }}相</p>
            <p class="text-sm text-text-secondary">电流相角偏差：{{ r.angleDiffI.toFixed(2) }}°</p>
            <p class="text-sm">{{ r.currentAngleOK ? '合格' : '超限' }}</p>
          </div>
        </div>
        <p class="mt-4 text-lg font-semibold" :class="result.overallResult === 'PASS' ? 'text-green-400' : 'text-red-400'">{{ result.conclusion }}</p>
        <div class="mt-3 text-sm text-text-secondary space-y-1">
          <p>三相电流不平衡度：{{ result.unbalanceRate.toFixed(2) }}%</p>
          <p>A/B/C相功率因数：{{ result.pf.A.toFixed(3) }} / {{ result.pf.B.toFixed(3) }} / {{ result.pf.C.toFixed(3) }}</p>
          <p>A相负荷性质：{{ result.loadTypeA }}</p>
        </div>
        <ul class="mt-3 list-disc pl-5 text-sm text-text-secondary">
          <li v-for="rec in result.recommendations" :key="rec">{{ rec }}</li>
        </ul>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, reactive, ref, watch } from 'vue'
import { Alert, Button, Card, Input, Select } from '../design-system'

const phases = ['A', 'B', 'C']

const CT_PRESETS = {
  '110kV': { primary: 400, secondary: 5 },
  '35kV': { primary: 300, secondary: 5 },
  '10kV': { primary: 600, secondary: 5 },
  '0.4kV': { primary: 100, secondary: 5 }
}

const PT_PRESETS = {
  '110kV': { primary: 110000, secondary: 100 },
  '35kV': { primary: 35000, secondary: 100 },
  '10kV': { primary: 10000, secondary: 100 },
  '0.4kV': { primary: 400, secondary: 100 }
}

const referenceDb = {
  line: {
    receive: { UA: 0, UB: -120, UC: 120, IA: -30, IB: -150, IC: 90 },
    send: { UA: 0, UB: -120, UC: 120, IA: 150, IB: 30, IC: -90 }
  },
  capacitor: {
    receive: { UA: 0, UB: -120, UC: 120, IA: 90, IB: -30, IC: 210 },
    send: { UA: 0, UB: -120, UC: 120, IA: 90, IB: -30, IC: 210 }
  },
  transformer_backup: {
    receive: { UA: 0, UB: -120, UC: 120, IA: -30, IB: -150, IC: 90 },
    send: { UA: 0, UB: -120, UC: 120, IA: 150, IB: 30, IC: -90 }
  }
}

const voltageOptions = [
  { label: '110kV', value: '110kV' },
  { label: '35kV', value: '35kV' },
  { label: '10kV', value: '10kV' },
  { label: '0.4kV', value: '0.4kV' }
]
const deviceOptions = [
  { label: '110kV线路保护', value: 'line' },
  { label: '主变后备保护', value: 'transformer_backup' },
  { label: '10kV电容器保护', value: 'capacitor' }
]
const runModeOptions = [
  { label: '受进', value: 'receive' },
  { label: '送出', value: 'send' }
]
const clampOptions = [
  { label: '正向', value: 'forward' },
  { label: '反向', value: 'reverse' }
]

const form = reactive({
  stationName: '',
  testDate: new Date().toISOString().slice(0, 10),
  voltageLevel: '110kV',
  ptPrimary: 110000,
  ptSecondary: 100,
  ctPrimary: 400,
  ctSecondary: 5,
  deviceType: 'line',
  runMode: 'receive',
  clampDirection: 'forward',
  angleTolerance: 5,
  ampTolerance: 10,
  UAAmp: 57.7, UAAng: 0,
  UBAmp: 57.7, UBAng: -120,
  UCAmp: 57.7, UCAng: 120,
  IAAmp: 3.5, IAAng: -28,
  IBAmp: 3.5, IBAng: -148,
  ICAmp: 3.5, ICAng: 92,
})

watch(() => form.voltageLevel, (lvl) => {
  form.ctPrimary = CT_PRESETS[lvl].primary
  form.ctSecondary = CT_PRESETS[lvl].secondary
  form.ptPrimary = PT_PRESETS[lvl].primary
  form.ptSecondary = PT_PRESETS[lvl].secondary
})

const errors = ref([])
const warnings = ref([])
const result = ref(null)

const normalizeAngle = (deg) => {
  let a = ((deg % 360) + 360) % 360
  if (a > 180) a -= 360
  return a
}

const correctCurrentAngle = (angle) => form.clampDirection === 'reverse' ? normalizeAngle(angle + 180) : normalizeAngle(angle)

const canRun = computed(() => {
  const required = ['ptPrimary', 'ptSecondary', 'ctPrimary', 'ctSecondary', 'angleTolerance', 'ampTolerance', 'UAAmp', 'UBAmp', 'UCAmp', 'IAAmp', 'IBAmp', 'ICAmp']
  return required.every(k => Number.isFinite(form[k]) && form[k] !== '' && form[k] >= 0)
})

function validate() {
  const errs = []
  const warns = []
  for (const k of ['ptPrimary','ptSecondary','ctPrimary','ctSecondary','angleTolerance','ampTolerance']) {
    if (!(form[k] > 0)) errs.push(`${k} 必须大于0`)
  }
  for (const ph of phases) {
    const uAmp = form[`U${ph}Amp`]
    const iAmp = form[`I${ph}Amp`]
    const uAng = form[`U${ph}Ang`]
    const iAng = form[`I${ph}Ang`]
    if (uAmp < 0 || iAmp < 0) errs.push(`${ph}相幅值不能为负数`)
    if (Math.abs(uAng) > 360 || Math.abs(iAng) > 360) warns.push(`${ph}相角输入超过±360°，已自动归一化`) 
    if (iAmp < 0.05) warns.push(`${ph}相二次电流<0.05A，负荷偏小影响判断准确性`)
    if (iAmp > form.ctSecondary * 1.2) warns.push(`${ph}相二次电流超过CT二次额定120%`) 
  }
  errors.value = errs
  warnings.value = warns
  return errs.length === 0
}

const measuredVectors = computed(() => {
  const arr = []
  for (const ph of phases) {
    arr.push({ key: `U${ph}`, amp: form[`U${ph}Amp`], ang: normalizeAngle(form[`U${ph}Ang`]), color: phColor(ph, false), dashed: false })
    arr.push({ key: `I${ph}`, amp: form[`I${ph}Amp`], ang: correctCurrentAngle(form[`I${ph}Ang`]), color: phColor(ph, true), dashed: true })
  }
  return arr
})

const referenceVectors = computed(() => {
  const ref = referenceDb[form.deviceType]?.[form.runMode]
  if (!ref) return []
  return phases.flatMap(ph => ([
    { key: `U${ph}`, amp: 1, ang: normalizeAngle(ref[`U${ph}`]), color: phColor(ph, false), dashed: false },
    { key: `I${ph}`, amp: 0.85, ang: normalizeAngle(ref[`I${ph}`]), color: phColor(ph, true), dashed: true }
  ]))
})

function runCompare() {
  if (!validate()) return
  const meas = {}
  const pf = {}
  for (const ph of phases) {
    const uAng = normalizeAngle(form[`U${ph}Ang`])
    const iAng = correctCurrentAngle(form[`I${ph}Ang`])
    const phi = normalizeAngle(iAng - uAng)
    pf[ph] = Math.cos(phi * Math.PI / 180)
    meas[ph] = { uAng, iAng, iAmp: form[`I${ph}Amp`] }
  }

  const avgI = (form.IAAmp + form.IBAmp + form.ICAmp) / 3
  const unbalanceRate = avgI > 0 ? Math.max(
    Math.abs(form.IAAmp - avgI), Math.abs(form.IBAmp - avgI), Math.abs(form.ICAmp - avgI)
  ) / avgI * 100 : 0
  if (unbalanceRate > 20) warnings.value.push('三相电流不平衡度超过20%，请核实测量数据')

  const ref = referenceDb[form.deviceType][form.runMode]
  const base = meas.A.uAng
  const phaseResults = phases.map(ph => {
    const measI = normalizeAngle(meas[ph].iAng - base)
    const refI = normalizeAngle(ref[`I${ph}`])
    const angleDiffI = normalizeAngle(measI - refI)
    return { phase: ph, angleDiffI, currentAngleOK: Math.abs(angleDiffI) <= form.angleTolerance }
  })
  const failPhases = phaseResults.filter(r => !r.currentAngleOK).map(r => r.phase)
  const allPass = failPhases.length === 0
  const recommendations = generateRecommendations(phaseResults)

  result.value = {
    phaseResults,
    overallResult: allPass ? 'PASS' : 'FAIL',
    conclusion: allPass
      ? '✅ 带负荷试验相角校验正常，接线关系基本正确'
      : `❌ ${failPhases.join('、')}相电流相角异常，请核查CT极性/钳表方向/相序`,
    recommendations,
    unbalanceRate,
    pf,
    loadTypeA: loadTypeFromPhi(normalizeAngle(meas.A.iAng - meas.A.uAng))
  }
}

function generateRecommendations(phaseResults) {
  const recs = []
  const failed = phaseResults.filter(r => !r.currentAngleOK)
  if (failed.length === 3) {
    const all180 = failed.every(r => Math.abs(Math.abs(r.angleDiffI) - 180) < 20)
    recs.push(all180 ? '三相均偏差约180°，疑似CT极性反接或钳表方向选择错误' : '三相均异常，请优先核查相序与钳表方向')
  } else if (failed.length === 1) {
    recs.push(`仅${failed[0].phase}相异常，疑似该相CT二次接线或极性问题`)
  } else if (failed.length === 2) {
    recs.push('两相异常，疑似相序接错')
  }
  recs.push('确认钳表方向（正向/反向）与现场一致')
  recs.push('确认PT、CT变比与装置配置一致')
  return recs
}

function loadTypeFromPhi(phi) {
  if (phi > 0) return '容性（电流超前电压）'
  if (phi < 0) return '感性（电流滞后电压）'
  return '纯阻性'
}

function phColor(ph, current) {
  const map = { A: current ? '#ff8888' : '#ff4444', B: current ? '#88cc88' : '#44aa44', C: current ? '#ffdd66' : '#ffb300' }
  return map[ph]
}

function resetForm() {
  form.stationName = ''
  form.testDate = new Date().toISOString().slice(0, 10)
  form.voltageLevel = '110kV'
  form.deviceType = 'line'
  form.runMode = 'receive'
  form.clampDirection = 'forward'
  form.angleTolerance = 5
  form.ampTolerance = 10
  form.UAAmp = 57.7; form.UAAng = 0
  form.UBAmp = 57.7; form.UBAng = -120
  form.UCAmp = 57.7; form.UCAng = 120
  form.IAAmp = 3.5; form.IAng = -28
  form.IBAmp = 3.5; form.IBAng = -148
  form.ICAmp = 3.5; form.ICAng = 92
  errors.value = []
  warnings.value = []
  result.value = null
}

async function copyReport() {
  if (!result.value) return
  const text = [
    '═══════════════════════════════════════',
    '  带负荷试验相角校验记录',
    '═══════════════════════════════════════',
    `变电站：${form.stationName || '__________'}  日期：${form.testDate}`,
    `试验装置：${deviceOptions.find(d => d.value === form.deviceType)?.label}`,
    `电压等级：${form.voltageLevel}   PT变比：${form.ptPrimary}/${form.ptSecondary}`,
    `CT变比：${form.ctPrimary}/${form.ctSecondary}`,
    '',
    '【实测数据】（二次值）',
    `Ua: ${form.UAAmp}V/${normalizeAngle(form.UAAng)}°  Ub: ${form.UBAmp}V/${normalizeAngle(form.UBAng)}°  Uc: ${form.UCAmp}V/${normalizeAngle(form.UCAng)}°`,
    `Ia: ${form.IAAmp}A/${correctCurrentAngle(form.IAng)}°  Ib: ${form.IBAmp}A/${correctCurrentAngle(form.IBAng)}°  Ic: ${form.ICAmp}A/${correctCurrentAngle(form.ICAng)}°`,
    '',
    '【对比结论】',
    result.value.conclusion,
    ...result.value.phaseResults.map(r => `${r.phase}相偏差：${r.angleDiffI.toFixed(2)}°（${r.currentAngleOK ? '合格' : '超限'}）`),
    '═══════════════════════════════════════'
  ].join('\n')
  try {
    await navigator.clipboard.writeText(text)
    alert('已复制试验记录')
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    alert('已复制试验记录（降级模式）')
  }
}

const PhasorSvg = defineComponent({
  name: 'PhasorSvg',
  props: { vectors: { type: Array, default: () => [] } },
  setup(props) {
    return () => h('svg', { viewBox: '0 0 320 320', class: 'w-full h-[320px] bg-surfaceHighlight/20 rounded-lg' }, [
      h('circle', { cx: 160, cy: 160, r: 90, stroke: '#4b5563', 'stroke-width': 1, fill: 'none' }),
      h('line', { x1: 20, y1: 160, x2: 300, y2: 160, stroke: '#374151', 'stroke-width': 1 }),
      h('line', { x1: 160, y1: 20, x2: 160, y2: 300, stroke: '#374151', 'stroke-width': 1 }),
      ...(() => {
        const vals = props.vectors || []
        const u = vals.filter(v => String(v.key || '').startsWith('U')).map(v => Math.abs(Number(v.amp) || 0))
        const i = vals.filter(v => String(v.key || '').startsWith('I')).map(v => Math.abs(Number(v.amp) || 0))
        const maxU = Math.max(...u, 1)
        const maxI = Math.max(...i, 1)
        const minRadius = 26

        return vals.map(v => {
          const amp = Math.max(Math.abs(Number(v.amp) || 0), 0)
          const isCurrent = String(v.key || '').startsWith('I')
          const denom = isCurrent ? maxI : maxU
          const ratio = denom > 0 ? amp / denom : 0
          const r = amp === 0 ? 0 : Math.max(minRadius, ratio * 90)
          const rad = (Number(v.ang) || 0) * Math.PI / 180
          const x = 160 + r * Math.cos(rad)
          const y = 160 - r * Math.sin(rad)
          return h('g', { key: v.key }, [
            h('line', {
              x1: 160, y1: 160, x2: x, y2: y, stroke: v.color, 'stroke-width': 2,
              'stroke-dasharray': v.dashed ? '5,4' : '0'
            }),
            h('circle', { cx: x, cy: y, r: 2.5, fill: v.color }),
            h('text', { x: x + 4, y: y - 4, fill: v.color, 'font-size': 11 }, `${v.key} ${Number(v.ang).toFixed(1)}°`)
          ])
        })
      })()
    ])
  }
})
</script>
