<template>
  <div class="space-y-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-100">短路电流计算</h1>

    <!-- 系统参数 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">系统参数</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">系统短路容量 (MVA)</label>
          <input type="number" step="0.1" v-model.number="system.shortCircuitMVA" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
          <p class="text-xs text-gray-500 mt-1">母线短路容量，用于计算系统阻抗</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">系统额定电压 (kV)</label>
          <input type="number" step="0.1" v-model.number="system.sysVoltage_kV" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">主变短路阻抗 (%)</label>
          <input type="number" step="0.01" v-model.number="transformer.zk_percent" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">线路单位阻抗 R (Ω/km)</label>
          <input type="number" step="0.01" v-model.number="line.R_per_km" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">线路单位阻抗 X (Ω/km)</label>
          <input type="number" step="0.01" v-model.number="line.X_per_km" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">线路长度 (km)</label>
          <input type="number" step="0.1" v-model.number="line.length_km" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
      </div>
    </div>

    <!-- 故障点设置 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">故障点设置</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">故障类型</label>
          <select v-model="fault.type" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100">
            <option value="3ph">三相短路</option>
            <option value="2ph">两相短路</option>
            <option value="1ph">单相接地</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">故障点距首端距离 (km)</label>
          <input type="number" step="0.1" v-model.number="fault.distance_km" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
      </div>
    </div>

    <!-- 计算按钮 -->
    <button @click="runCalculation" :disabled="calculating" class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-900 text-white font-bold py-4 px-8 rounded-lg shadow transition flex items-center justify-center gap-2">
      <span v-if="calculating">计算中...</span>
      <span v-else>计算短路电流</span>
    </button>

    <!-- 结果面板 -->
    <div v-if="results" class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">计算结果</h2>
        <button @click="copyResults" class="text-sm bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded border transition">复制方案</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="p-4 bg-gray-800 rounded">
          <p class="text-gray-400 mb-1">系统短路容量</p>
          <p class="text-2xl font-mono text-green-400">{{ system.shortCircuitMVA }} MVA</p>
        </div>
        <div class="p-4 bg-gray-800 rounded">
          <p class="text-gray-400 mb-1">系统阻抗 Z_sys</p>
          <p class="text-2xl font-mono text-blue-400">{{ results.Z_sys.toFixed(4) }} Ω</p>
        </div>
        <div class="p-4 bg-gray-800 rounded">
          <p class="text-gray-400 mb-1">主变短路阻抗 Z_tr</p>
          <p class="text-2xl font-mono text-blue-400">{{ results.Z_tr.toFixed(4) }} Ω</p>
        </div>
        <div class="p-4 bg-gray-800 rounded">
          <p class="text-gray-400 mb-1">线路阻抗 Z_line</p>
          <p class="text-2xl font-mono text-blue-400">{{ results.Z_line.toFixed(4) }} Ω</p>
        </div>
        <div class="p-4 bg-gray-800 rounded">
          <p class="text-gray-400 mb-1">总阻抗 Z_total</p>
          <p class="text-2xl font-mono text-green-400">{{ results.Z_total.toFixed(4) }} Ω</p>
        </div>
        <div class="p-4 bg-gray-800 rounded">
          <p class="text-gray-400 mb-1">短路电流（一次）</p>
          <p class="text-2xl font-mono text-yellow-400">{{ results.I_sc_1st.toFixed(2) }} A</p>
        </div>
        <div class="p-4 bg-gray-800 rounded">
          <p class="text-gray-400 mb-1">短路电流（二次）</p>
          <p class="text-2xl font-mono text-yellow-400">{{ results.I_sc_2nd.toFixed(2) }} A</p>
        </div>
        <div class="p-4 bg-gray-800 rounded">
          <p class="text-gray-400 mb-1">故障类型</p>
          <p class="text-2xl font-mono text-gray-100">{{ fault.type === '3ph' ? '三相短路' : fault.type === '2ph' ? '两相短路' : '单相接地' }}</p>
        </div>
      </div>

      <div class="p-4 bg-gray-800 rounded text-sm">
        <p class="text-gray-400 mb-1">计算公式</p>
        <p class="text-gray-300 font-mono">Z_sys = U² / S_sc</p>
        <p class="text-gray-300 font-mono">Z_tr = (U / (√3 × I_n)) × (Zk% / 100)</p>
        <p class="text-gray-300 font-mono">Z_line = (R + jX) × L</p>
        <p class="text-gray-300 font-mono">I_sc = U / (√3 × Z_total)</p>
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
import { reactive, ref, computed } from 'vue'

const system = reactive({
  shortCircuitMVA: 1000,
  sysVoltage_kV: 110
})

const transformer = reactive({
  zk_percent: 13.92
})

const line = reactive({
  R_per_km: 0.4,
  X_per_km: 1.2,
  length_km: 10
})

const fault = reactive({
  type: '3ph',
  distance_km: 10
})

const calculating = ref(false)
const results = ref(null)
const errors = ref([])

function roundTo(value, digits) {
  if (value === null || value === undefined) return null
  const factor = Math.pow(10, digits)
  return Math.round(value * factor) / factor
}

function validate() {
  const errs = []
  if (!system.shortCircuitMVA || system.shortCircuitMVA <= 0) errs.push('系统短路容量必须大于 0')
  if (!system.sysVoltage_kV || system.sysVoltage_kV <= 0) errs.push('系统电压必须大于 0')
  if (!transformer.zk_percent || transformer.zk_percent <= 0) errs.push('主变短路阻抗必须大于 0')
  if (!line.R_per_km || line.R_per_km < 0) errs.push('线路电阻应 ≥ 0')
  if (!line.X_per_km || line.X_per_km < 0) errs.push('线路电抗应 ≥ 0')
  if (!line.length_km || line.length_km <= 0) errs.push('线路长度必须大于 0')
  if (!fault.distance_km || fault.distance_km < 0) errs.push('故障点距离应 ≥ 0')
  errors.value = errs
  return errs.length === 0
}

function runCalculation() {
  if (!validate()) {
    return
  }

  calculating.value = true
  try {
    // 1. 系统阻抗 Z_sys = U² / S_sc (Ω)
    const U_sys = system.sysVoltage_kV * 1e3 // V (线电压)
    const S_sc = system.shortCircuitMVA * 1e6 // VA
    const Z_sys = (U_sys * U_sys) / S_sc

    // 2. 主变短路阻抗 Z_tr (Ω)
    // 先计算主变额定电流
    const I_n = S_sc / (Math.sqrt(3) * U_sys) // 一次额定电流 (A)
    // Z_base = U² / S，但这里短路阻抗通常以额定电流和电压为基准
    // 简化：Z_tr = (U / (√3×I_n)) × (Zk% / 100)
    const Z_base = U_sys / (Math.sqrt(3) * I_n)
    const Z_tr = Z_base * (transformer.zk_percent / 100)

    // 3. 线路阻抗 Z_line (Ω)
    const R_line = line.R_per_km * fault.distance_km
    const X_line = line.X_per_km * fault.distance_km
    const Z_line = Math.sqrt(R_line * R_line + X_line * X_line)

    // 4. 总阻抗
    const Z_total = Z_sys + Z_tr + Z_line

    // 5. 短路电流（一次值，线电压）
    const I_sc_1st = U_sys / (Math.sqrt(3) * Z_total)

    // 6. 二次电流（按 CT 变比 600/5 = 120 估算？这里暂用固定变比 120 演示，实际应由用户输入）
    // 暂时固定为 120:5 (即 600/5)
    const nCT_assumed = 120 // 600/5 = 120
    const I_sc_2nd = I_sc_1st / nCT_assumed

    results.value = {
      Z_sys: roundTo(Z_sys, 4),
      Z_tr: roundTo(Z_tr, 4),
      Z_line: roundTo(Z_line, 4),
      Z_total: roundTo(Z_total, 4),
      I_sc_1st: roundTo(I_sc_1st, 4),
      I_sc_2nd: roundTo(I_sc_2nd, 4)
    }
  } finally {
    calculating.value = false
  }
}

function copyResults() {
  if (!results.value) return
  const r = results.value
  const lines = [
    '【短路电流计算结果】',
    `系统短路容量：${system.shortCircuitMVA} MVA`,
    `系统电压：${system.sysVoltage_kV} kV`,
    `主变短路阻抗：${transformer.zk_percent}%`,
    `线路阻抗：${line.R_per_km} + j${line.X_per_km} Ω/km × ${line.length_km} km`,
    `故障类型：${fault.type === '3ph' ? '三相短路' : fault.type === '2ph' ? '两相短路' : '单相接地'}`,
    `故障点距离：${fault.distance_km} km`,
    '',
    '阻抗计算结果：',
    `- 系统阻抗 Z_sys = ${r.Z_sys.toFixed(4)} Ω`,
    `- 主变阻抗 Z_tr = ${r.Z_tr.toFixed(4)} Ω`,
    `- 线路阻抗 Z_line = ${r.Z_line.toFixed(4)} Ω`,
    `- 总阻抗 Z_total = ${r.Z_total.toFixed(4)} Ω`,
    '',
    '短路电流：',
    `- 一次电流 = ${r.I_sc_1st.toFixed(2)} A`,
    `- 二次电流（按 CT 600/5 估算） = ${r.I_sc_2nd.toFixed(2)} A`,
    '',
    '注意：实际二次电流应以现场 CT 变比为准确。'
  ]
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    alert('已复制')
  }).catch(() => alert('复制失败'))
}
</script>

<style scoped>
</style>
