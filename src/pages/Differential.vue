<template>
  <div class="space-y-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-100">比率制动差动保护校验</h1>

    <!-- 主变参数 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">主变参数</h2>
        <button @click="fillTransformerDefaults" class="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded border transition">填入默认值</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">容量 (MVA)</label>
          <input type="number" step="0.1" v-model.number="transformer.params.capacity" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">高压侧电压 (kV)</label>
          <input type="number" step="0.1" v-model.number="transformer.params.voltages.hv" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">低压侧电压 (kV)</label>
          <input type="number" step="0.1" v-model.number="transformer.params.voltages.lv" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">高压侧 CT 变比</label>
          <input type="text" placeholder="如 600/5" v-model="transformer.params.ctRatios.hv" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">低压侧 CT 变比</label>
          <input type="text" placeholder="如 4000/5" v-model="transformer.params.ctRatios.lv" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">装置 CT 配置</label>
          <select v-model="transformer.params.deviceConfig" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100">
            <option value="delta-to-wye">三角转星（常用）</option>
            <option value="wye-to-delta">星转三角</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">高压侧连接方式</label>
          <select v-model="transformer.params.windingConnection.hv" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100">
            <option value="Y">星形 (Y)</option>
            <option value="D">三角形 (D)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">高压侧时钟数</label>
          <select v-model.number="transformer.params.clockNumbers.hv" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100">
            <option v-for="n in 12" :key="n" :value="n-1">{{ n-1 }}</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p class="text-gray-400 mb-1">高压侧一次额定电流</p>
          <p class="text-lg font-mono text-green-400">{{ transformer.ratedCurrentsPrimary.hv ? transformer.ratedCurrentsPrimary.hv.toFixed(2) : '--' }} A</p>
        </div>
        <div>
          <p class="text-gray-400 mb-1">低压侧一次额定电流</p>
          <p class="text-lg font-mono text-green-400">{{ transformer.ratedCurrentsPrimary.lv ? transformer.ratedCurrentsPrimary.lv.toFixed(2) : '--' }} A</p>
        </div>
        <div></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p class="text-gray-400 mb-1">高压侧二次额定电流</p>
          <p class="text-lg font-mono text-green-400">{{ transformer.ratedCurrentsSecondary.hv ? transformer.ratedCurrentsSecondary.hv.toFixed(2) : '--' }} A</p>
        </div>
        <div>
          <p class="text-gray-400 mb-1">低压侧二次额定电流</p>
          <p class="text-lg font-mono text-green-400">{{ transformer.ratedCurrentsSecondary.lv ? transformer.ratedCurrentsSecondary.lv.toFixed(2) : '--' }} A</p>
        </div>
        <div>
          <p class="text-gray-400 mb-1">装置 CT 因子</p>
          <p class="text-lg font-mono text-blue-400">{{ deviceFactor.toFixed(3) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-gray-400 mb-1">折算系数 K_LV</p>
          <p class="text-lg font-mono text-blue-400">{{ transformer.conversionFactors.lv.toFixed(3) }}</p>
        </div>
        <div></div>
      </div>
    </div>

    <!-- 差动整定参数 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">差动保护整定</h2>
        <div class="flex gap-2">
          <button @click="fillCalcDefaults" class="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded border transition">一键填入</button>
          <button @click="clearAll" class="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded border transition">一键清空</button>
          <button @click="generateDebugPlan" class="text-sm bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded border transition">生成调试方案</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">最小动作电流 Id_min (A)</label>
          <input type="number" step="0.01" v-model.number="calcStore.settings.Id_min" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">拐点电流 I_break (A)</label>
          <input type="number" step="0.1" v-model.number="calcStore.settings.I_break" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">制动系数 k1 (启动区)</label>
          <input type="number" step="0.01" v-model.number="calcStore.settings.k1" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">制动系数 k2 (比率区)</label>
          <input type="number" step="0.01" v-model.number="calcStore.settings.k2" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
      </div>

      <div class="mt-4 p-3 bg-gray-800 rounded text-sm">
        <p class="text-gray-400">判据：</p>
        <p class="text-gray-300 font-mono"><KaTeX :formula="'I_{res} < I_{break} \\Rightarrow I_{diff} > I_{d_{min}} + k_1 \\times I_{res}'" /></p>
        <p class="text-gray-300 font-mono"><KaTeX :formula="'I_{res} \\ge I_{break} \\Rightarrow I_{diff} > I_{d_{min}} + k_2 \\times (I_{res} - I_{break})'" /></p>
      </div>
    </div>

    <!-- 测试序列 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">测试序列（高压侧单相加流）</h2>
      </div>
      <div class="mb-2 text-sm text-gray-300">
        序列基于 I_break 自动生成：0.5 × I_break → 3 × I_break，步长 0.5 × I_break
      </div>
      <div class="p-3 bg-blue-900/30 border border-blue-700/30 rounded font-mono text-blue-200">
        {{ testSequenceDisplay }}
      </div>
    </div>

    <!-- 校验结果 -->
    <div v-if="results" class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">校验结果</h2>
        <button @click="copyTestPlan" :disabled="toast.show" class="text-sm bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded border transition disabled:opacity-50">复制校验模板</button>
      </div>

      <div class="overflow-x-auto mb-6">
        <table class="min-w-full text-sm text-gray-300">
          <thead class="bg-gray-800">
            <tr>
              <th class="px-4 py-3 text-left">序号</th>
              <th class="px-4 py-3 text-left">I_res (A)</th>
              <th class="px-4 py-3 text-left">I_diff (A)</th>
              <th class="px-4 py-3 text-left">I_diff 整定值 (A)</th>
              <th class="px-4 py-3 text-left">动作</th>
              <th class="px-4 py-3 text-left">区域</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in results.table" :key="idx" :class="row.operate ? 'bg-green-900/20' : 'bg-red-900/10'">
              <td class="px-4 py-3">{{ idx + 1 }}</td>
              <td class="px-4 py-3">{{ row.Ires.toFixed(2) }}</td>
              <td class="px-4 py-3">{{ row.I_diff.toFixed(2) }}</td>
              <td class="px-4 py-3 font-mono text-blue-300">{{ row.Id_set.toFixed(4) }}</td>
              <td class="px-4 py-3 font-mono">{{ row.operate ? '动作' : '不动作' }}</td>
              <td class="px-4 py-3">{{ row.region === 1 ? '启动区' : '比率区' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="results.curve" class="mb-6">
        <DiffChart :data="results" />
      </div>

      <div class="p-3 bg-gray-800 rounded text-sm">
        <p class="text-gray-400 mb-1">折算系数说明：</p>
        <p>HV→装置：K = 1.000</p>
        <p>LV→装置：K = {{ results.factors.lv.toFixed(4) }}</p>
      </div>
    </div>

    <!-- 校验模板复制 -->
    <div v-if="results" class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">校验模板</h2>
        <button @click="copyTestPlan" :disabled="toast.show" class="text-sm bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded border transition disabled:opacity-50">复制完整模板</button>
      </div>
      <p class="text-sm text-gray-400">包含：整定参数、校验点表、步骤说明、记录栏。</p>
    </div>

    <!-- 全局错误提示 -->
    <div v-if="errors.length" class="bg-red-900/30 border border-red-700 rounded-lg p-4">
      <h3 class="text-red-400 font-semibold mb-2">请检查以下问题：</h3>
      <ul class="list-disc pl-5 space-y-1 text-red-300 text-sm">
        <li v-for="(err, idx) in errors" :key="idx">{{ err }}</li>
      </ul>
    </div>

    <!-- 调试方案模态框 -->
    <transition name="fade">
      <div v-if="showDebugModal" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div class="bg-gray-900 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
          <button @click="showDebugModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">✕</button>
          <h2 class="text-2xl font-bold text-gray-100 mb-4">现场调试方案（Yd11 差动保护）</h2>

          <div v-if="!debugPlan" class="text-gray-300">
            点击上方"生成调试方案"按钮生成接线图和调试台指令。
          </div>

          <div v-else>
            <div class="mb-6 prose max-w-none text-gray-300" v-html="debugPlan.instructions.wiring.replace(/\n/g, '<br>')"></div>

            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-2">调试台通道设置</h3>
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm text-gray-300 border border-gray-700">
                  <thead class="bg-gray-800">
                    <tr>
                      <th class="px-4 py-2 border">通道</th>
                      <th class="px-4 py-2 border">位置</th>
                      <th class="px-4 py-2 border">电流 (A)</th>
                      <th class="px-4 py-2 border">相位 (°)</th>
                      <th class="px-4 py-2 border">频率</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ch in debugPlan.instructions.channels" :key="ch.number">
                      <td class="px-4 py-2 border">{{ ch.number }}</td>
                      <td class="px-4 py-2 border">{{ ch.phase }}</td>
                      <td class="px-4 py-2 border">{{ ch.magnitude }}</td>
                      <td class="px-4 py-2 border">{{ ch.phaseAngle }}</td>
                      <td class="px-4 py-2 border">{{ ch.frequency }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-2">注意事项</h3>
              <ul class="list-disc pl-5 space-y-1 text-red-300">
                <li v-for="(note, idx) in debugPlan.instructions.notes" :key="idx">{{ note }}</li>
              </ul>
            </div>

            <div class="flex justify-end">
              <button @click="showDebugModal = false" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">关闭</button>
              <button @click="copyDebugPlan" class="ml-3 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded">复制调试方案</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useTransformerStore } from '../store/transformerStore'
import { useCalculationStore } from '../store/calculationStore'
import DiffChart from '../components/DiffChart.vue'
import KaTeX from '../components/KaTeX.vue'
import { generateBalancePlan } from '../utils/balanceCalculator'
import { roundTo } from '../utils/unitConverter'
import { transformSideCurrent, calculateDifferentialCurrent, calculateBrakingCurrent, checkOperatingCriteria } from '../calc/differentialEngine'

const transformer = useTransformerStore()
const calcStore = useCalculationStore()
const toast = ref({ show: false, message: '' })
const showDebugModal = ref(false)
const debugPlan = ref(null)

const deviceFactor = computed(() => transformer.params.deviceConfig === 'delta-to-wye' ? 1 / Math.sqrt(3) : Math.sqrt(3))

const testCurrents = computed(() => {
  const I_break = Number(calcStore.settings.I_break)
  if (!I_break) return []
  const start = 0.5 * I_break
  const end = 3 * I_break
  const step = 0.5 * I_break
  const seq = []
  for (let I = start; I <= end + 1e-6; I += step) {
    seq.push(Number(I.toFixed(4)))
  }
  return seq
})

const testSequenceDisplay = computed(() => {
  return testCurrents.value.map(c => c.toFixed(2)).join(' A | ')
})

const errors = computed(() => {
  const errs = []
  const { capacity, voltages, ctRatios } = transformer.params
  if (!capacity || Number(capacity) <= 0) errs.push('容量必须大于 0')
  if (!voltages.hv || Number(voltages.hv) <= 0) errs.push('高压侧电压必须大于 0')
  if (voltages.lv && Number(voltages.lv) <= 0) errs.push('低压侧电压必须大于 0')
  ;['hv', 'lv'].forEach(side => {
    const r = ctRatios[side]
    if (r) {
      const m = r.toString().match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/)
      if (!m) errs.push(`${side === 'hv' ? '高压' : '低压'}侧 CT 变比格式错误`)
      else if (Number(m[2]) === 0) errs.push(`${side === 'hv' ? '高压' : '低压'}侧 CT 二次侧不能为 0`)
    }
  })
  const { Id_min, I_break, k1, k2 } = calcStore.settings
  if (Id_min === '' || Number(Id_min) <= 0) errs.push('最小动作电流必须大于 0')
  if (I_break === '' || Number(I_break) <= 0) errs.push('拐点电流必须大于 0')
  if (k1 === '' || Number(k1) <= 0) errs.push('制动系数 k1 必须大于 0')
  if (k2 === '' || Number(k2) <= 0) errs.push('制动系数 k2 必须大于 0')
  return errs
})

const results = computed(() => {
  if (errors.value.length > 0) return null
  const Id_min = Number(calcStore.settings.Id_min)
  const I_break = Number(calcStore.settings.I_break)
  const k1 = Number(calcStore.settings.k1)
  const k2 = Number(calcStore.settings.k2)
  const K_LV = transformer.conversionFactors.lv
  const devFactor = deviceFactor.value
  const p = transformer.params
  const currents = testCurrents.value
  if (currents.length === 0) return null

  const table = currents.map(I_test => {
    const I_H = transformSideCurrent(I_test, 1, p.windingConnection.hv === 'D', p.clockNumbers.hv, devFactor)
    const I_L = transformSideCurrent(0, K_LV, p.windingConnection.lv === 'D', p.clockNumbers.lv, devFactor)
    const I_diff = calculateDifferentialCurrent(I_H, I_L).abs()
    const I_res = calculateBrakingCurrent(I_H, I_L).abs()
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

  return { table, factors: { lv: K_LV } }
})

function fillTransformerDefaults() {
  transformer.params.capacity = 50
  transformer.params.voltages.hv = 110
  transformer.params.voltages.lv = 10.5
  transformer.params.ctRatios.hv = '600/5'
  transformer.params.ctRatios.lv = '4000/5'
  transformer.params.windingConnection.hv = 'Y'
  transformer.params.windingConnection.lv = 'D'
  transformer.params.clockNumbers.hv = 0
  transformer.params.clockNumbers.lv = 11
  transformer.params.deviceConfig = 'delta-to-wye'
}

function fillCalcDefaults() {
  calcStore.settings.Id_min = 0.5
  calcStore.settings.I_break = 2
  calcStore.settings.k1 = 0.5
  calcStore.settings.k2 = 0.5
}

function clearAll() {
  transformer.params.capacity = ''
  transformer.params.voltages.hv = ''
  transformer.params.voltages.lv = ''
  transformer.params.ctRatios.hv = ''
  transformer.params.ctRatios.lv = ''
  calcStore.settings.Id_min = ''
  calcStore.settings.I_break = ''
  calcStore.settings.k1 = ''
  calcStore.settings.k2 = ''
}

function copyTestPlan() {
  if (!results.value) return
  const { table, factors } = results.value
  const { Id_min, I_break, k1, k2 } = calcStore.settings
  const text = `【差动保护校验记录（两绕组）】

装置名称：_________
校验人员：_________
日期：_________

主变参数：
- 容量：${transformer.params.capacity} MVA
- 高压侧电压：${transformer.params.voltages.hv} kV
- 低压侧电压：${transformer.params.voltages.lv} kV
- 高压侧 CT 变比：${transformer.params.ctRatios.hv}
- 低压侧 CT 变比：${transformer.params.ctRatios.lv}
- 装置 CT 配置：${transformer.params.deviceConfig === 'delta-to-wye' ? '三角转星' : '星转三角'}
- 折算系数 K_LV = ${factors.lv.toFixed(4)}

整定参数：
- 最小动作电流 Id_min = ${Id_min} A
- 拐点电流 I_break = ${I_break} A
- 制动系数 k1 = ${k1}
- 制动系数 k2 = ${k2}

校验点表：
序号 | I_res (A) | I_diff (A) | I_diff 整定值 (A) | 动作
--- | --- | --- | --- | ---
${table.map((r, i) => `${i+1} | ${r.Ires.toFixed(2)} | ${r.I_diff.toFixed(2)} | ${r.Id_set.toFixed(4)} | ${r.operate ? '动作' : '不动作'}`).join('\n')}

校验步骤：
1. 按 I_break 的 0.5~3 倍设置制动电流（高压侧）
2. 每点先加至 0.95 * I_res 检查不动作
3. 再加至测试点 I_diff，记录动作情况
4. 通过标准：误差 <= +-5%

记录：
□ 校验通过
□ 需整改：_________

备注：_________`
  navigator.clipboard.writeText(text).then(() => {
    toast.value.message = '已复制：校验模板'
    toast.value.show = true
    setTimeout(() => { toast.value.show = false }, 2000)
  }).catch(() => alert('复制失败'))
}

function generateDebugPlan() {
  if (!transformer.params.capacity || !transformer.params.voltages.hv || !transformer.params.voltages.lv || !transformer.params.ctRatios.hv || !transformer.params.ctRatios.lv) {
    alert('请先完善主变参数和 CT 变比')
    return
  }
  if (!calcStore.settings.I_break) {
    alert('请输入拐点电流 I_break')
    return
  }
  debugPlan.value = generateBalancePlan(
    transformer.params.capacity,
    transformer.params.voltages,
    transformer.params.ctRatios,
    transformer.params.windingConnection,
    transformer.params.deviceConfig
  )
  showDebugModal.value = true
}

function copyDebugPlan() {
  if (!debugPlan.value) return
  const { instructions } = debugPlan.value
  const text = `【Yd11 主变差动保护现场调试方案】

一、通平衡接线

调试台通道设置：
${instructions.channels.map(ch => `通道${ch.number} → ${ch.phase}: ${ch.magnitude}A, ${ch.phaseAngle}°, ${ch.frequency}Hz`).join('\n')}

物理接线：
- 高压侧 A 相 → 通道1
- 高压侧 B 相 → 通道2
- 高压侧 C 相悬空
- 低压侧 C 相 → 通道3
- 低压侧 A、B 相悬空

操作：
1. 退出差动保护出口压板
2. 按上表设置调试台三路输出
3. 同时输出，观察装置差流 Id
4. 调整装置平衡系数 Kb 直至 Id < 0.02In

注意事项：
${instructions.notes.join('\n')}

二、斜率校验

${instructions.wiring}
`
  navigator.clipboard.writeText(text).then(() => {
    toast.value.message = '已复制：调试方案'
    toast.value.show = true
    setTimeout(() => { toast.value.show = false }, 2000)
  }).catch(() => alert('复制失败'))
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>