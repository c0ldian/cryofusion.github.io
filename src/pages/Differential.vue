<template>
  <div class="space-y-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-100">主变差动保护校验</h1>

    <!-- 主变参数 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">主变参数</h2>
        <button @click="fillTransformerDefaults" class="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded border transition">填入默认值</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">容量 (MVA)</label>
          <input type="number" step="0.1" v-model.number="params.Sn_MVA" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">高压侧电压 (kV)</label>
          <input type="number" step="0.1" v-model.number="params.UH_kV" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">低压侧电压 (kV)</label>
          <input type="number" step="0.1" v-model.number="params.UL_kV" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">接线组别</label>
          <select v-model="params.groupStr" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100">
            <option value="YNd11">YNd11 (最常见)</option>
            <option value="YNd1">YNd1</option>
            <option value="YNd5">YNd5</option>
            <option value="YNd7">YNd7</option>
            <option value="YNd9">YNd9</option>
            <option value="Yd1">Yd1</option>
            <option value="Yd5">Yd5</option>
            <option value="Yd11">Yd11</option>
            <option value="YNy0">YNy0 (无角差)</option>
            <option value="Yy0">Yy0</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">高压侧 CT 变比</label>
          <input type="text" placeholder="如 600/5" v-model="params.nCTH_str" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">低压侧 CT 变比</label>
          <input type="text" placeholder="如 4000/5" v-model="params.nCTL_str" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">软件补偿方向</label>
          <select v-model="params.compDir" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100">
            <option value="H">高压侧补偿（角转星）</option>
            <option value="L">低压侧补偿（星转角）</option>
          </select>
          <p class="text-xs text-yellow-600 mt-1">必须与保护装置设置一致！YNd11 常用 H</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">装置 CT 配置</label>
          <select v-model="params.deviceConfig" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100">
            <option value="delta-to-wye">三角转星（常见）</option>
            <option value="wye-to-delta">星转三角</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">制动电流定义</label>
          <select v-model="params.Ir_mode" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100">
            <option value="avg">求和型（Ir = (|I_H|+|I_L|)/2）</option>
            <option value="max">最大值型（Ir = max(|I_H|,|I_L|)）</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p class="text-gray-400 mb-1">高压侧二次额定电流</p>
          <p class="text-lg font-mono text-green-400">{{ ratedCurrents.I_H_2nd ? ratedCurrents.I_H_2nd.toFixed(2) : '--' }} A</p>
        </div>
        <div>
          <p class="text-gray-400 mb-1">低压侧二次额定电流</p>
          <p class="text-lg font-mono text-green-400">{{ ratedCurrents.I_L_2nd ? ratedCurrents.I_L_2nd.toFixed(2) : '--' }} A</p>
        </div>
        <div>
          <p class="text-gray-400 mb-1">组别角差</p>
          <p class="text-lg font-mono text-blue-400">{{ thetaGroupDeg }}°</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-gray-400 mb-1">折算系数 K_LV</p>
          <p class="text-lg font-mono text-blue-400">{{ conversionFactors.lv.toFixed(4) }}</p>
        </div>
        <div>
          <p class="text-gray-400 mb-1">装置 CT 因子</p>
          <p class="text-lg font-mono text-blue-400">{{ deviceFactor.toFixed(4) }}</p>
        </div>
      </div>
    </div>

    <!-- 差动整定参数 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">差动保护整定（标幺值）</h2>
        <div class="flex gap-2">
          <button @click="fillCalcDefaults" class="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded border transition">一键填入</button>
          <button @click="clearAll" class="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded border transition">一键清空</button>
          <button @click="runValidation" :disabled="calculating" class="text-sm bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded border transition">生成校验</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">最小动作电流 Id_min (pu)</label>
          <input type="number" step="0.01" v-model.number="settings.Id_min" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">拐点电流 Ir_break (pu)</label>
          <input type="number" step="0.1" v-model.number="settings.Ir_break" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">制动系数 K1</label>
          <input type="number" step="0.01" v-model.number="settings.K1" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">制动系数 K2</label>
          <input type="number" step="0.01" v-model.number="settings.K2" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
      </div>

      <div class="mt-4 p-3 bg-gray-800 rounded text-sm">
        <p class="text-gray-400">判据（标幺值）：</p>
        <p class="text-gray-300 font-mono">$I_r \le I_{r,\text{break}}: I_{d,\text{th}} = I_{d,\text{min}} + K_1 \times I_r$</p>
        <p class="text-gray-300 font-mono">$I_r > I_{r,\text{break}}: I_{d,\text{th}} = I_{d,\text{min}} + K_1 \times I_{r,\text{break}} + K_2 \times (I_r - I_{r,\text{break}})$</p>
      </div>
    </div>

    <!-- 测试配置 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">测试配置</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">注入模式</label>
          <select v-model="config.injectMode" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100">
            <option value="single_phase">单相平衡（3路电流）</option>
            <option value="three_phase">三相平衡（6路电流）</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">测试仪电流通道数</label>
          <select v-model="config.ctChannels" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100">
            <option :value="3">3路</option>
            <option :value="6">6路</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">生成测试序列</label>
          <button @click="autoGenerateSequence" class="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">自动生成序列</button>
        </div>
      </div>
      <div class="mt-2 text-sm text-gray-400">
        序列：制动电流 Ir 从 0.5×Ir_break 到 3×Ir_break，步长 0.5×Ir_break
      </div>
    </div>

    <!-- 校验结果 -->
    <div v-if="results" class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">校验结果与注入量</h2>
        <button @click="copyTestPlan" :disabled="toast.show" class="text-sm bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded border transition disabled:opacity-50">复制完整方案</button>
      </div>

      <div class="overflow-x-auto mb-6">
        <table class="min-w-full text-sm text-gray-300 border border-gray-800">
          <thead class="bg-gray-800">
            <tr>
              <th class="px-4 py-3 border">Ir(pu)</th>
              <th class="px-4 py-3 border">Id_boundary(pu)</th>
              <th v-if="config.injectMode === 'single_phase'" class="px-4 py-3 border">注入（单相）</th>
              <th v-else class="px-4 py-3 border">注入（三相）</th>
              <th class="px-4 py-3 border">动作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(pt, idx) in results.slope_test_points" :key="idx" :class="isTrialExpectedTrip(pt) ? 'bg-green-900/20' : 'bg-red-900/10'">
              <td class="px-4 py-3 font-mono">{{ pt.Ir_pu }}</td>
              <td class="px-4 py-3 font-mono text-blue-300">{{ pt.Id_boundary }}</td>
              <td class="px-4 py-3 font-mono" v-if="config.injectMode === 'single_phase'">
                H_A: {{ pt.inject.I_H_A.magnitude.toFixed(1) }}/{{ pt.inject.I_H_A.angle_deg }}°<br>
                L_A: {{ pt.inject.I_L_A.magnitude.toFixed(1) }}/{{ pt.inject.I_L_A.angle_deg }}°
              </td>
              <td class="px-4 py-3 font-mono" v-else>
                H: (A{{ pt.inject.I_H_A.magnitude.toFixed(1) }}/{{ pt.inject.I_H_A.angle_deg }}° B{{ pt.inject.I_H_B.magnitude.toFixed(1) }}/{{ pt.inject.I_H_B.angle_deg }}° C{{ pt.inject.I_H_C.magnitude.toFixed(1) }}/{{ pt.inject.I_H_C.angle_deg }}°)<br>
                L: (A{{ pt.inject.I_L_A.magnitude.toFixed(1) }}/{{ pt.inject.I_L_A.angle_deg }}° B{{ pt.inject.I_L_B.magnitude.toFixed(1) }}/{{ pt.inject.I_L_B.angle_deg }}° C{{ pt.inject.I_L_C.magnitude.toFixed(1) }}/{{ pt.inject.I_L_C.angle_deg }}°)
              </td>
              <td class="px-4 py-3 font-bold" :class="isTrialExpectedTrip(pt) ? 'text-green-400' : 'text-red-400'">应动作</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-3 bg-gray-800 rounded text-sm mb-6">
        <p class="text-gray-400 mb-1">接线指导（依据 ctChannels={{ config.ctChannels }}，{{ config.injectMode === 'three_phase' ? '三相平衡' : '单相平衡' }}）</p>
        <ul class="list-disc pl-5 space-y-1 text-gray-300">
          <li v-if="config.ctChannels === 6">
            <strong>六路输出：</strong>高压侧 I1/I2/I3 → IHA/IHB/IHC；低压侧 I4/I5/I6 → ILA/ILB/ILC；极性：CT S1 朝母线（高压）或变压器（低压）。
          </li>
          <li v-else>
            <strong>三路输出：</strong>单相接线时仅需一侧注入；如需扫斜率，需分步换接或利用 TA 断线闭锁逻辑。
          </li>
          <li>
            <strong>组别角差：</strong>{{ groupDisplay }}，低压侧超前高压侧 {{ thetaGroupDeg }}°。补偿方向：{{ params.compDir === 'H' ? '高压侧补偿（角转星）' : '低压侧补偿（星转角）' }}。
          </li>
          <li>
            <strong>相角设置：</strong>高压侧 A 相参考 0°；低压侧 A 相应设置为 {{ injectMode === 'three_phase' ? (params.compDir === 'H' ? 180 : 180 - thetaGroupDeg) : 180 }}°（穿越方向）。
          </li>
        </ul>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div class="p-3 bg-gray-800 rounded">
          <p class="text-gray-400 mb-1">折算系数 K_LV</p>
          <p class="text-lg font-mono text-blue-400">{{ conversionFactors.lv.toFixed(4) }}</p>
        </div>
        <div class="p-3 bg-gray-800 rounded">
          <p class="text-gray-400 mb-1">装置 CT 因子</p>
          <p class="text-lg font-mono text-blue-400">{{ deviceFactor.toFixed(4) }}</p>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
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
          <h2 class="text-2xl font-bold text-gray-100 mb-4">差动保护现场调试方案</h2>

          <div v-if="!results" class="text-gray-300">
            请先填写参数并点击“生成校验”。
          </div>

          <div v-else>
            <div class="mb-6 prose max-w-none text-gray-300" v-html="debugInstructions.wiring.replace(/\n/g, '<br>')"></div>

            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-2">调试台通道设置</h3>
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm text-gray-300 border border-gray-700">
                  <thead class="bg-gray-800">
                    <tr>
                      <th class="px-4 py-2 border">通道</th>
                      <th class="px-4 py-2 border">接入侧</th>
                      <th class="px-4 py-2 border">电流 (A)</th>
                      <th class="px-4 py-2 border">相位 (°)</th>
                      <th class="px-4 py-2 border">频率</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ch in debugInstructions.channels" :key="ch.number">
                      <td class="px-4 py-2 border">{{ ch.number }}</td>
                      <td class="px-4 py-2 border">{{ ch.side }}</td>
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
                <li v-for="(note, idx) in debugInstructions.notes" :key="idx">{{ note }}</li>
              </ul>
            </div>

            <div class="flex justify-end">
              <button @click="showDebugModal = false" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">关闭</button>
              <button @click="copyDebugPlan" class="ml-3 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded">复制方案</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue'
import { useTransformerStore } from '../store/transformerStore'
import { calcDifferentialTest, calcRatedCurrents } from '../calc/differentialEngine'

const transformer = useTransformerStore()
const toast = ref({ show: false, message: '' })
const showDebugModal = ref(false)
const results = ref(null)
const debugInstructions = ref(null)
const calculating = ref(false)

// UI参数（从 transformer store 拆分）
const params = reactive({
  Sn_MVA: 50,
  UH_kV: 110,
  UL_kV: 10.5,
  groupStr: 'YNd11',
  nCTH_str: '600/5',
  nCTL_str: '4000/5',
  compDir: 'H',
  deviceConfig: 'delta-to-wye',
  Ir_mode: 'avg'
})

const settings = reactive({
  Id_min: 0.5,
  K1: 0.5,
  K2: 0.5,
  Ir_break: 2.0
})

const config = reactive({
  injectMode: 'three_phase',
  ctChannels: 6
})

// 计算属性
const deviceFactor = computed(() => params.deviceConfig === 'delta-to-wye' ? 1 / Math.sqrt(3) : Math.sqrt(3))

const conversionFactors = computed(() => {
  if (!transformer || !transformer.conversionFactors) return { lv: 1.0 }
  return transformer.conversionFactors
})

const ratedCurrents = computed(() => {
  const nCTH = parseCTRatio(params.nCTH_str)
  const nCTL = parseCTRatio(params.nCTL_str)
  if (!nCTH || !nCTL) return { I_H_2nd: 0, I_L_2nd: 0 }
  return calcRatedCurrents(params.Sn_MVA, params.UH_kV, params.UL_kV, nCTH, nCTL)
})

const thetaGroupDeg = computed(() => {
  const m = String(params.groupStr).match(/(\d+)$/)
  const grp = m ? parseInt(m[1], 10) : 0
  return grp * 30
})

const groupDisplay = computed(() => `${params.groupStr} (角差 ${thetaGroupDeg.value}°)`)

const errors = computed(() => {
  const errs = []
  if (!params.Sn_MVA || params.Sn_MVA <= 0) errs.push('容量必须大于 0')
  if (!params.UH_kV || params.UH_kV <= 0) errs.push('高压侧电压必须大于 0')
  if (!params.UL_kV || params.UL_kV <= 0) errs.push('低压侧电压必须大于 0')
  const nCTH = parseCTRatio(params.nCTH_str)
  const nCTL = parseCTRatio(params.nCTL_str)
  if (!nCTH) errs.push('高压侧 CT 变比错误')
  if (!nCTL) errs.push('低压侧 CT 变比错误')
  if (!settings.Id_min || settings.Id_min <= 0) errs.push('Id_min 必须大于 0')
  if (!settings.Ir_break || settings.Ir_break <= 0) errs.push('Ir_break 必须大于 0')
  if (!settings.K1 || settings.K1 <= 0) errs.push('K1 必须大于 0')
  if (!settings.K2 || settings.K2 <= 0) errs.push('K2 必须大于 0')
  return errs
})

// 方法
function parseCTRatio(str) {
  if (!str) return null
  const m = String(str).trim().match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/)
  if (!m) return null
  return parseFloat(m[1]) / parseFloat(m[2])
}

function fillTransformerDefaults() {
  params.Sn_MVA = 50
  params.UH_kV = 110
  params.UL_kV = 10.5
  params.nCTH_str = '600/5'
  params.nCTL_str = '4000/5'
  params.compDir = 'H'
  params.deviceConfig = 'delta-to-wye'
}

function fillCalcDefaults() {
  settings.Id_min = 0.5
  settings.K1 = 0.5
  settings.K2 = 0.5
  settings.Ir_break = 2.0
}

function clearAll() {
  params.Sn_MVA = ''
  params.UH_kV = ''
  params.UL_kV = ''
  params.nCTH_str = ''
  params.nCTL_str = ''
  settings.Id_min = ''
  settings.K1 = ''
  settings.K2 = ''
  settings.Ir_break = ''
}

function runValidation() {
  if (!errors.value || errors.value.length === 0) {
    calculating.value = true
    try {
      const nCTH = parseCTRatio(params.nCTH_str)
      const nCTL = parseCTRatio(params.nCTL_str)

      const result = calcDifferentialTest({
        Sn_MVA: params.Sn_MVA,
        UH_kV: params.UH_kV,
        UL_kV: params.UL_kV,
        groupStr: params.groupStr,
        nCTH,
        nCTL,
        Id_min_pu: settings.Id_min,
        K1: settings.K1,
        K2: settings.K2,
        Ir_break_pu: settings.Ir_break,
        Ir_mode: params.Ir_mode,
        compDir: params.compDir,
        injectMode: config.injectMode,
        ctChannels: config.ctChannels
      })

      results.value = result
      showDebugModal.value = false
    } catch (e) {
      console.error('calcDifferentialTest error:', e)
      alert('计算失败：' + e.message)
    } finally {
      calculating.value = false
    }
  } else {
    alert('请先填写完整参数：' + errors.value.join('，'))
  }
}

function autoGenerateSequence() {
  runValidation()
}

function isTrialExpectedTrip(pt) {
  // 所有序列点都是动作边界点，应动作
  return true
}

function copyTestPlan() {
  if (!results.value) return
  const r = results.value
  const lines = [
    '【差动保护校验方案】',
    `主变：${params.Sn_MVA} MVA, ${params.UH_kV}/${params.UL_kV} kV, ${params.groupStr}`,
    `CT变比：高压 ${params.nCTH_str}，低压 ${params.nCTL_str}`,
    `补偿方向：${params.compDir === 'H' ? '高压侧补偿（角转星）' : '低压侧补偿（星转角）'}，装置CT配置：${params.deviceConfig}`,
    `整定：Id_min=${settings.Id_min}, K1=${settings.K1}, K2=${settings.K2}, Ir_break=${settings.Ir_break} (${params.Ir_mode})`,
    '',
    '注入点（Ir → Id_boundary）：'
  ]

  r.slope_test_points.forEach(pt => {
    const inject = pt.inject || {}
    lines.push(`Ir=${pt.Ir_pu}, Id_boundary=${pt.Id_boundary}`)
    if (config.injectMode === 'single_phase') {
      lines.push(`  H_A=${inject.I_H_A?.magnitude?.toFixed(1) ?? '-'} / ${inject.I_H_A?.angle_deg ?? '-'}°, L_A=${inject.I_L_A?.magnitude?.toFixed(1) ?? '-'} / ${inject.I_L_A?.angle_deg ?? '-'}°`)
    } else {
      lines.push(`  H：(A${inject.I_H_A?.magnitude?.toFixed(1) ?? '-'} / ${inject.I_H_A?.angle_deg ?? '-'}° B${inject.I_H_B?.magnitude?.toFixed(1) ?? '-'} / ${inject.I_H_B?.angle_deg ?? '-'}° C${inject.I_H_C?.magnitude?.toFixed(1) ?? '-'} / ${inject.I_H_C?.angle_deg ?? '-'}°)`)
      lines.push(`  L：(A${inject.I_L_A?.magnitude?.toFixed(1) ?? '-'} / ${inject.I_L_A?.angle_deg ?? '-'}° B${inject.I_L_B?.magnitude?.toFixed(1) ?? '-'} / ${inject.I_L_B?.angle_deg ?? '-'}° C${inject.I_L_C?.magnitude?.toFixed(1) ?? '-'} / ${inject.I_L_C?.angle_deg ?? '-'}°)`)
    }
  })


  if (Array.isArray(r.relay_tester_plan) && r.relay_tester_plan.length) {
    lines.push('')
    lines.push('调试仪步骤参数：')
    r.relay_tester_plan.forEach(step => {
      lines.push(`步骤${step.step} ${step.name} | 频率=${step.frequency_hz}Hz | 保持=${step.hold_time_s}s | 超时=${step.timeout_s}s`)
      step.channels.forEach(ch => {
        lines.push(`  CH${ch.number}(${ch.side}) = ${Number(ch.magnitude_A).toFixed(3)}A ∠${ch.angle_deg}°`)
      })
    })
  }
  lines.push('')
  lines.push('接线：')
  if (config.ctChannels === 6) {
    lines.push('- 六路输出：I1/I2/I3 → 高压 IHA/IHB/IHC；I4/I5/I6 → 低压 ILA/ILB/ILC')
    lines.push('- 极性：高压侧CT S1 朝母线，低压侧CT S1 朝变压器')
  } else {
    lines.push('- 三路输出：需分步换接或利用TA断线逻辑')
  }
  lines.push(`- 低压侧相对高压侧超前 ${thetaGroupDeg.value}°，补偿方向：${params.compDir}`)
  lines.push('')
  lines.push('注意：测试仪注入为补偿前原始值；保护装置软件补偿需按本方案一致。')

  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    toast.value.message = '已复制方案'
    toast.value.show = true
    setTimeout(() => toast.value.show = false, 2000)
  }).catch(() => alert('复制失败'))
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
