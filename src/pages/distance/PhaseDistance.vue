<template>
  <div class="space-y-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-100">相间距离校验</h1>

    <!-- 系统参数 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">系统参数</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">额定电压 Un (kV)</label>
          <input type="number" step="0.1" v-model.number="system.Un_kV" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">CT变比 nCT</label>
          <input type="number" step="1" v-model.number="system.nCT" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">PT变比 nPT</label>
          <input type="number" step="1" v-model.number="system.nPT" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">正序单位电阻 R1 (Ω/km)</label>
          <input type="number" step="0.01" v-model.number="system.R1_per_km" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">正序单位电抗 X1 (Ω/km)</label>
          <input type="number" step="0.01" v-model.number="system.X1_per_km" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">系统短路阻抗 ZS (Ω)</label>
          <div class="flex gap-2">
            <input type="number" step="0.01" v-model.number="system.RS" placeholder="R" class="w-1/2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
            <input type="number" step="0.01" v-model.number="system.XS" placeholder="X" class="w-1/2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
          </div>
        </div>
      </div>
    </div>

    <!-- 测量配置 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">测量配置</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">故障类型</label>
          <select v-model="measurement.fault_type" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100">
            <option value="AB">AB 相短路</option>
            <option value="BC">BC 相短路</option>
            <option value="CA">CA 相短路</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">线路总长 L (km)</label>
          <input type="number" step="0.1" v-model.number="measurement.L_km" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">测量点位置 x (km)</label>
          <input type="number" step="0.1" v-model.number="measurement.d_km" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
          <p class="text-xs text-gray-500 mt-1">默认线路中点: {{ measurement.L_km / 2 }} km</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">故障电阻 Rf (Ω)</label>
          <input type="number" step="0.1" v-model.number="measurement.Rf" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">是否模拟线路阻抗</label>
          <select v-model="measurement.simulateLine" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100">
            <option :value="true">是</option>
            <option :value="false">否（测量点直接加量）</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 整定参数（多段） -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">整定参数（三段式）</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">I段阻抗定值 Z_I (Ω)</label>
          <input type="number" step="0.01" v-model.number="settings.Z_I" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">II段阻抗定值 Z_II (Ω)</label>
          <input type="number" step="0.01" v-model.number="settings.Z_II" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">III段阻抗定值 Z_III (Ω)</label>
          <input type="number" step="0.01" v-model.number="settings.Z_III" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">I段时间 t_I (s)</label>
          <input type="number" step="0.01" v-model.number="settings.t_I" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">II段时间 t_II (s)</label>
          <input type="number" step="0.01" v-model.number="settings.t_II" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">III段时间 t_III (s)</label>
          <input type="number" step="0.01" v-model.number="settings.t_III" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
      </div>
    </div>

    <!-- 校验按钮 -->
    <button @click="runValidation" :disabled="calculating" class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-900 text-white font-bold py-4 px-8 rounded-lg shadow transition flex items-center justify-center gap-2">
      <span v-if="calculating">计算中...</span>
      <span v-else>生成调试方案</span>
    </button>

    <!-- 结果表格 -->
    <div v-if="results.length" class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">校验结果</h2>
        <button @click="copyResults" class="text-sm bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded border transition">复制方案</button>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm text-gray-300 border border-gray-800">
          <thead class="bg-gray-800">
            <tr>
              <th class="px-3 py-2 border">序</th>
              <th class="px-3 py-2 border">故障</th>
              <th class="px-3 py-2 border">U_A (V/°)</th>
              <th class="px-3 py-2 border">U_B (V/°)</th>
              <th class="px-3 py-2 border">U_C (V/°)</th>
              <th class="px-3 py-2 border">I_A (A/°)</th>
              <th class="px-3 py-2 border">I_B (A/°)</th>
              <th class="px-3 py-2 border">I_C (A/°)</th>
              <th class="px-3 py-2 border">Z_meas (Ω)</th>
              <th class="px-3 py-2 border">动作</th>
              <th class="px-3 py-2 border">t (s)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in results" :key="idx" :class="row.zone !== 'No trip' ? 'bg-green-900/20' : 'bg-red-900/10'">
              <td class="px-3 py-2 border text-center">{{ idx + 1 }}</td>
              <td class="px-3 py-2 border text-center">{{ row.fault_type }}</td>
              <td class="px-3 py-2 border text-center font-mono text-blue-300">{{ row.U_A_V.toFixed(1) }}/{{ row.phi_U_A_deg }}°</td>
              <td class="px-3 py-2 border text-center font-mono text-blue-300">{{ row.U_B_V.toFixed(1) }}/{{ row.phi_U_B_deg }}°</td>
              <td class="px-3 py-2 border text-center font-mono text-blue-300">{{ row.U_C_V.toFixed(1) }}/{{ row.phi_U_C_deg }}°</td>
              <td class="px-3 py-2 border text-center font-mono text-green-300">{{ row.I_A_A.toFixed(2) }}/{{ row.phi_I_A_deg }}°</td>
              <td class="px-3 py-2 border text-center font-mono text-green-300">{{ row.I_B_A.toFixed(2) }}/{{ row.phi_I_B_deg }}°</td>
              <td class="px-3 py-2 border text-center font-mono text-green-300">{{ row.I_C_A.toFixed(2) }}/{{ row.phi_I_C_deg }}°</td>
              <td class="px-3 py-2 border text-center font-mono">{{ row.Zm_ohm }}</td>
              <td class="px-3 py-2 border text-center font-bold" :class="row.zone !== 'No trip' ? 'text-green-400' : 'text-red-400'">{{ row.zone === 'No trip' ? '不动作' : '动作' }}</td>
              <td class="px-3 py-2 border text-center">{{ row.t_action_s !== null ? row.t_action_s.toFixed(3) : '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 p-4 bg-gray-800 rounded text-sm" v-if="results[0]?.relay_tester_shot">
        <p class="text-gray-300 font-semibold mb-2">继保调试仪建议参数（单次故障步）</p>
        <p class="text-gray-400 mb-2">频率 {{ results[0].relay_tester_shot.frequency_hz }} Hz，故障前保持 {{ results[0].relay_tester_shot.prefault_hold_s }} s，故障保持 {{ results[0].relay_tester_shot.fault_hold_s }} s</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div v-for="ch in results[0].relay_tester_shot.channels" :key="ch.number" class="text-gray-300 font-mono">{{ ch.number }} = {{ ch.magnitude.toFixed(3) }} {{ ch.unit }} ∠{{ ch.angle_deg.toFixed(2) }}°</div>
        </div>
      </div>

      <div class="mt-4 p-4 bg-gray-800 rounded text-sm">
        <p class="text-gray-400 mb-1">调试台接线说明：</p>
        <p class="text-gray-300">- 电压：三路电压通道对应 U_A、U_B、U_C（线电压 U_AB 按下式计算：U_AB = |U_A - U_B|，但通常调试仪直接输出相电压）</p>
        <p class="text-gray-300">- 电流：故障相输出 I_A、I_B，非故障相 I_C=0</p>
        <p class="text-gray-300">- 相位：表中角度为相对自身的参考方向（通常以电压为参考或独立显示），请按实际需要调整极性</p>
        <p class="text-gray-300 mt-2 text-yellow-400">注意：本计算仅考虑正序+负序回路，未计及零序分量；适用于相间距离保护校验。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { calcPhaseFault } from '../../calc/distanceEngine.js'

const system = reactive({
  Un_kV: 110,
  nCT: 600,      // 一次/二次变比
  nPT: 1000,     // 一次/二次变比 (如 10000/100)
  R1_per_km: 0.4, // Ω/km
  X1_per_km: 1.2, // Ω/km
  RS: 0.5,       // 系统等效电阻
  XS: 5.0,       // 系统等效电抗
})

const measurement = reactive({
  fault_type: 'AB',
  L_km: 30,
  d_km: 15,      // 默认中点
  Rf: 0,         // 金属性
  simulateLine: true, // 是否模拟线路阻抗到测量点
})

const settings = reactive({
  Z_I: 10.0,
  Z_II: 20.0,
  Z_III: 30.0,
  t_I: 0.3,
  t_II: 0.8,
  t_III: 1.5,
})

const calculating = ref(false)
const results = ref([])

function runValidation() {
  if (!system.Un_kV || !system.nCT || !system.nPT || measurement.L_km <= 0) {
    alert('请先填写完整且有效的系统参数')
    return
  }

  const d_km = measurement.simulateLine
    ? Math.min(Math.max(Number(measurement.d_km) || 0, 0), Number(measurement.L_km))
    : 0

  measuringAdjust(d_km)

  calculating.value = true
  try {
    const res = calcPhaseFault({
      Un_kV: system.Un_kV,
      nCT: system.nCT,
      nPT: system.nPT,
      R1_per_km: system.R1_per_km,
      X1_per_km: system.X1_per_km,
      RS: system.RS,
      XS: system.XS,
      d_km,
      Rf: measurement.Rf,
      fault_type: measurement.fault_type,
      Zset_I: settings.Z_I,
      Zset_II: settings.Z_II,
      Zset_III: settings.Z_III,
      t_I: settings.t_I,
      t_II: settings.t_II,
      t_III: settings.t_III,
    })
    results.value = [res]
  } finally {
    calculating.value = false
  }
}

function measuringAdjust(d_km) {
  if (measurement.simulateLine) {
    measurement.d_km = d_km
  }
}

function copyResults() {
  if (!results.value.length) return
  const header = '序号,故障类型,U_A (V/°),U_B (V/°),U_C (V/°),I_A (A/°),I_B (A/°),I_C (A/°),Z_meas (Ω),动作,理论时间 (s)'
  const rows = results.value.map((r, i) =>
    `${i+1},${r.fault_type},${r.U_A_V.toFixed(1)}/${r.phi_U_A_deg.toFixed(1)}°,${r.U_B_V.toFixed(1)}/${r.phi_U_B_deg.toFixed(1)}°,${r.U_C_V.toFixed(1)}/${r.phi_U_C_deg.toFixed(1)}°,${r.I_A_A.toFixed(2)}/${r.phi_I_A_deg.toFixed(1)}°,${r.I_B_A.toFixed(2)}/${r.phi_I_B_deg.toFixed(1)}°,${r.I_C_A.toFixed(2)}/${r.phi_I_C_deg.toFixed(1)}°,${r.Zm_ohm},${r.zone !== 'No trip' ? '动作' : '不动作'},${r.t_action_s !== null ? r.t_action_s.toFixed(3) : '-'}`
  )
  const tester = results.value[0]?.relay_tester_shot
  const testerLines = tester ? [
    '',
    `调试仪参数: f=${tester.frequency_hz}Hz, 故障前保持=${tester.prefault_hold_s}s, 故障保持=${tester.fault_hold_s}s, 预期动作时间=${tester.expected_trip_time_s ?? '-'}s`,
    ...tester.channels.map(ch => `${ch.number}=${ch.magnitude.toFixed(3)}${ch.unit} ∠${ch.angle_deg.toFixed(2)}°`)
  ] : []
  const text = [header, ...rows, ...testerLines].join('\n')
  navigator.clipboard.writeText(text).then(() => {
    alert('复制成功')
  }).catch(() => alert('复制失败'))
}
</script>

<style scoped>
</style>
