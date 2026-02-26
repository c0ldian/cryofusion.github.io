<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-100">主变短路试验计算</h1>
      <RouterLink to="/" class="text-sm bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition">返回主页</RouterLink>
    </div>

    <!-- 主变参数 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">主变参数</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">容量 (MVA)</label>
          <input type="number" step="0.1" v-model.number="params.Sn_MVA" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">高压侧额定电压 (kV)</label>
          <input type="number" step="0.1" v-model.number="params.UH_kV" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">低压侧额定电压 (kV)</label>
          <input type="number" step="0.1" v-model.number="params.UL_kV" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">高压侧 CT 变比</label>
          <input type="text" placeholder="如 600/5" v-model="params.nCTH_str" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">低压侧 CT 变比</label>
          <input type="text" placeholder="如 4000/5" v-model="params.nCTL_str" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
      </div>
    </div>

    <!-- 短路试验设置 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">短路试验设置</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">短路阻抗 (%)</label>
          <input type="number" step="0.01" v-model.number="testSettings.zk_percent" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
          <p class="text-xs text-gray-500 mt-1">如 13.92（%）</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">试验电压（一次） (kV)</label>
          <input type="number" step="0.1" v-model.number="testSettings.testVoltage_kV" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
          <p class="text-xs text-gray-500 mt-1">高压侧通入的一次电压（如 3kV, 5kV）</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">PT变比</label>
          <input type="text" placeholder="如 1000/100" v-model="params.nPT_str" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
          <p class="text-xs text-gray-500 mt-1">电压互感器变比，用于计算保护二次电压</p>
        </div>
      </div>
    </div>

    <!-- 计算按钮 -->
    <button @click="runCalculation" :disabled="calculating" class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-900 text-white font-bold py-4 px-8 rounded-lg shadow transition flex items-center justify-center gap-2">
      <span v-if="calculating">计算中...</span>
      <span v-else>开始计算</span>
    </button>

    <!-- 结果面板 -->
    <div v-if="results" class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">计算结果</h2>
        <button @click="copyResults" class="text-sm bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded border transition">复制方案</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="p-4 bg-gray-800 rounded">
          <p class="text-gray-400 mb-1">高压侧一次额定电流</p>
          <p class="text-2xl font-mono text-green-400">{{ results.I_H_1st_rated.toFixed(2) }} A</p>
        </div>
        <div class="p-4 bg-gray-800 rounded">
          <p class="text-gray-400 mb-1">低压侧一次额定电流</p>
          <p class="text-2xl font-mono text-green-400">{{ results.I_L_1st_rated.toFixed(2) }} A</p>
        </div>
        <div class="p-4 bg-gray-800 rounded">
          <p class="text-gray-400 mb-1">试验高压侧一次电流</p>
          <p class="text-2xl font-mono text-blue-400">{{ results.I_H_test_1st.toFixed(4) }} A</p>
        </div>
        <div class="p-4 bg-gray-800 rounded">
          <p class="text-gray-400 mb-1">试验高压侧二次电流</p>
          <p class="text-2xl font-mono text-blue-400">{{ results.I_H_test_2nd.toFixed(4) }} A</p>
        </div>
        <div class="p-4 bg-gray-800 rounded">
          <p class="text-gray-400 mb-1">试验高压侧二次电压</p>
          <p class="text-2xl font-mono text-blue-400">{{ results.U_H_test_2nd.toFixed(2) }} V</p>
        </div>
        <div class="p-4 bg-gray-800 rounded">
          <p class="text-gray-400 mb-1">试验低压侧一次电流</p>
          <p class="text-2xl font-mono text-blue-400">{{ results.I_L_test_1st.toFixed(4) }} A</p>
        </div>
        <div class="p-4 bg-gray-800 rounded">
          <p class="text-gray-400 mb-1">试验低压侧二次电流</p>
          <p class="text-2xl font-mono text-blue-400">{{ results.I_L_test_2nd.toFixed(4) }} A</p>
        </div>
      </div>

      <div class="p-4 bg-gray-800 rounded text-sm">
        <p class="text-gray-400 mb-1">试验接线说明</p>
        <ul class="list-disc pl-5 space-y-1 text-gray-300">
          <li>高压侧通入一次电压：{{ testSettings.testVoltage_kV }} kV</li>
          <li>保护电压二次值：{{ results.U_H_test_2nd.toFixed(1) }} V（线电压）</li>
          <li>高压侧套管 CT 二次电流：{{ results.I_H_test_2nd.toFixed(4) }} A</li>
          <li>低压侧套管 CT 二次电流：{{ results.I_L_test_2nd.toFixed(4) }} A</li>
          <li>主变中性点闸刀分开，低压侧短接（或通过套管 CT 二次短接）</li>
        </ul>
      </div>

      <div class="mt-4 p-4 bg-gray-800 rounded text-sm">
        <p class="text-gray-400 mb-1">计算公式</p>
        <p class="text-gray-300 font-mono">$I_{H,\text{rated}} = \frac{S}{\sqrt{3} \times U_H}$</p>
        <p class="text-gray-300 font-mono">$Z_k(\text{p.u.}) = \frac{\text{短路阻抗}\%}{100}$</p>
        <p class="text-gray-300 font-mono">$I_{H,\text{test},1\text{st}} = I_{H,\text{rated}} \times \frac{U_{\text{test}}}{U_H} \div Z_k$</p>
        <p class="text-gray-300 font-mono">$I_{H,\text{test},2\text{nd}} = I_{H,\text{test},1\text{st}} \div n_{\text{CT-H}}$</p>
        <p class="text-gray-300 font-mono">$U_{H,\text{test},2\text{nd}} = U_{\text{test}} \div n_{\text{PT}}$</p>
        <p class="text-gray-300 font-mono">$I_{L,\text{test},1\text{st}} = I_{H,\text{test},1\text{st}} \times \frac{U_H}{U_L}$</p>
        <p class="text-gray-300 font-mono">$I_{L,\text{test},2\text{nd}} = I_{L,\text{test},1\text{st}} \div n_{\text{CT-L}}$</p>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errors.length" class="bg-red-900/30 border border-red-700 rounded-lg p-4">
      <h3 class="text-red-400 font-semibold mb-2">请检查以下问题：</h3>
      <ul class="list-disc pl-5 space-y-1 text-red-300 text-sm">
        <li v-for="(err, idx) in errors" :key="idx">{{ err }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import {RouterLink} from 'vue-router'

const params = reactive({
  Sn_MVA: 50,
  UH_kV: 110,
  UL_kV: 10.5,
  nCTH_str: '600/5',
  nCTL_str: '4000/5',
  nPT_str: '1000/100' // PT变比，默认1000/100
})

const testSettings = reactive({
  zk_percent: 13.92,
  testVoltage_kV: 3.0 // 一次电压，默认3kV
})

const calculating = ref(false)
const results = ref(null)
const errors = ref([])

function parseCTRatio(str) {
  if (!str) return null
  const m = String(str).trim().match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/)
  if (!m) return null
  return parseFloat(m[1]) / parseFloat(m[2])
}

function roundTo(value, digits) {
  if (value === null || value === undefined) return null
  const factor = Math.pow(10, digits)
  return Math.round(value * factor) / factor
}

function validate() {
  const errs = []
  if (!params.Sn_MVA || params.Sn_MVA <= 0) errs.push('容量必须大于 0')
  if (!params.UH_kV || params.UH_kV <= 0) errs.push('高压侧电压必须大于 0')
  if (!params.UL_kV || params.UL_kV <= 0) errs.push('低压侧电压必须大于 0')
  const nCTH = parseCTRatio(params.nCTH_str)
  const nCTL = parseCTRatio(params.nCTL_str)
  const nPT = parseCTRatio(params.nPT_str)
  if (!nCTH) errs.push('高压侧 CT 变比错误')
  if (!nCTL) errs.push('低压侧 CT 变比错误')
  if (!nPT) errs.push('PT 变比错误')
  if (!testSettings.zk_percent || testSettings.zk_percent <= 0) errs.push('短路阻抗必须大于 0')
  if (!testSettings.testVoltage_kV || testSettings.testVoltage_kV <= 0) errs.push('试验电压必须大于 0')
  errors.value = errs
  return errs.length === 0
}

function runCalculation() {
  if (!validate()) {
    return
  }

  calculating.value = true
  try {
    const nCTH = parseCTRatio(params.nCTH_str)
    const nCTL = parseCTRatio(params.nCTL_str)
    const nPT = parseCTRatio(params.nPT_str)

    // 1. 高压侧一次额定电流 I_H_rated = S / (√3 × U_H)
    const Sn = params.Sn_MVA * 1e6
    const I_H_1st_rated = Sn / (Math.sqrt(3) * params.UH_kV * 1e3)

    // 2. 短路阻抗标幺值
    const Zk_pu = testSettings.zk_percent / 100

    // 3. 试验电压为一次电压（kV），转为 V
    const U_test_1st = testSettings.testVoltage_kV * 1e3
    const U_H_1st_rated = params.UH_kV * 1e3

    // 4. 试验时高压侧一次电流（按比例）
    // I_H_test_1st = I_H_1st_rated / Zk_pu × (U_test / U_H_rated)
    const I_H_test_1st = I_H_1st_rated / Zk_pu * (U_test_1st / U_H_1st_rated)

    // 5. 高压侧二次试验电流
    const I_H_test_2nd = I_H_test_1st / nCTH

    // 6. 保护装置感受到的二次电压（线电压）
    const U_H_test_2nd = U_test_1st / nPT // V

    // 7. 低压侧一次试验电流（通过电压变比换算）
    const ratio_voltage = params.UH_kV / params.UL_kV
    const I_L_test_1st = I_H_test_1st * ratio_voltage

    // 8. 低压侧二次试验电流
    const I_L_test_2nd = I_L_test_1st / nCTL

    // 9. 低压侧一次额定电流（参考）
    const I_L_1st_rated = Sn / (Math.sqrt(3) * params.UL_kV * 1e3)

    results.value = {
      I_H_1st_rated: roundTo(I_H_1st_rated, 4),
      I_L_1st_rated: roundTo(I_L_1st_rated, 4),
      I_H_test_1st: roundTo(I_H_test_1st, 4),
      I_H_test_2nd: roundTo(I_H_test_2nd, 4),
      U_H_test_2nd: roundTo(U_H_test_2nd, 4),
      I_L_test_1st: roundTo(I_L_test_1st, 4),
      I_L_test_2nd: roundTo(I_L_test_2nd, 4),
      Zk_percent: testSettings.zk_percent,
      testVoltage_kV: testSettings.testVoltage_kV
    }
  } finally {
    calculating.value = false
  }
}

function copyResults() {
  if (!results.value) return
  const r = results.value
  const lines = [
    '【主变短路试验方案】',
    `主变：${params.Sn_MVA} MVA, ${params.UH_kV}kV/${params.UL_kV}kV`,
    `CT变比：高压 ${params.nCTH_str}，低压 ${params.nCTL_str}`,
    `PT变比：${params.nPT_str}`,
    `短路阻抗：${testSettings.zk_percent}%`,
    `试验电压：${testSettings.testVoltage_kV} kV（高压侧一次）`,
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
    alert('已复制')
  }).catch(() => alert('复制失败'))
}
</script>

<style scoped>
</style>
