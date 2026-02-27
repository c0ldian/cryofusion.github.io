<template>
  <div class="space-y-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-100">方向距离校验</h1>

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
          <label class="block text-sm font-medium mb-2 text-gray-300">线路总长 L (km)</label>
          <input type="number" step="0.1" v-model.number="measurement.L_km" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">测量点位置 x (km)</label>
          <input type="number" step="0.1" v-model.number="measurement.d_km" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">故障电阻 Rf (Ω)</label>
          <input type="number" step="0.1" v-model.number="measurement.Rf" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">故障类型（用于计算测量阻抗）</label>
          <select v-model="measurement.fault_type" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100">
            <option value="AB">AB 相短路</option>
            <option value="BC">BC 相短路</option>
            <option value="CA">CA 相短路</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">方向校验通常以相间故障为测量场景</p>
        </div>
      </div>
    </div>

    <!-- 方向阻抗整定 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">方向阻抗整定</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">阻抗定值 Z_set (Ω)</label>
          <input type="number" step="0.01" v-model.number="settings.Zset_ohm" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">动作时间 t_set (s)</label>
          <input type="number" step="0.01" v-model.number="settings.t_set" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">方向灵敏角 θ_sens (°)</label>
          <input type="number" step="1" v-model.number="settings.theta_sens_deg" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
          <p class="text-xs text-yellow-600 mt-1">常用 -30°（滞后，指向线路正方向）</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">偏移系数 K_offset</label>
          <input type="number" step="0.01" v-model.number="settings.K_offset" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
          <p class="text-xs text-gray-500 mt-1">0~1，常见 0.1~0.2</p>
        </div>
      </div>
    </div>

    <!-- 校验按钮 -->
    <button @click="runValidation" :disabled="calculating" class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-900 text-white font-bold py-4 px-8 rounded-lg shadow transition flex items-center justify-center gap-2">
      <span v-if="calculating">计算中...</span>
      <span v-else>生成校验方案</span>
    </button>

    <!-- 结果面板 -->
    <div v-if="result" class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">校验结果</h2>
        <button @click="copyResults" class="text-sm bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded border transition">复制</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="p-4 bg-gray-800 rounded">
          <p class="text-gray-400">测量阻抗 Zm</p>
          <p class="text-2xl font-mono text-blue-400">{{ result.Zm_ohm.toFixed(4) }} Ω</p>
          <p class="text-sm text-gray-500">角度：{{ result.Zm_angle_deg.toFixed(2) }}°</p>
        </div>
        <div class="p-4 bg-gray-800 rounded">
          <p class="text-gray-400">方向判断</p>
          <p class="text-2xl font-mono" :class="result.trip ? 'text-green-400' : 'text-red-400'">{{ result.trip ? '正向·动作' : '反向·不动作' }}</p>
          <p class="text-sm text-gray-500">圆内: {{ result.in_circle }}, 角度窗口: {{ result.in_angle_window }}</p>
        </div>
      </div>

      <!-- 二次量输出表格 -->
      <div class="overflow-x-auto mb-6">
        <table class="min-w-full text-sm text-gray-300 border border-gray-800">
          <thead class="bg-gray-800">
            <tr>
              <th class="px-3 py-2 border">相</th>
              <th class="px-3 py-2 border">U (V)</th>
              <th class="px-3 py-2 border">φ_U (°)</th>
              <th class="px-3 py-2 border">I (A)</th>
              <th class="px-3 py-2 border">φ_I (°)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="bg-gray-900">
              <td class="px-3 py-2 border font-bold">A</td>
              <td class="px-3 py-2 border font-mono text-blue-300">{{ result.U_A_V.toFixed(1) }}</td>
              <td class="px-3 py-2 border font-mono">{{ result.phi_U_A_deg.toFixed(1) }}</td>
              <td class="px-3 py-2 border font-mono text-green-300">{{ result.I_A_A.toFixed(2) }}</td>
              <td class="px-3 py-2 border font-mono">{{ result.phi_I_A_deg.toFixed(1) }}</td>
            </tr>
            <tr class="bg-gray-800">
              <td class="px-3 py-2 border font-bold">B</td>
              <td class="px-3 py-2 border font-mono text-blue-300">{{ result.U_B_V.toFixed(1) }}</td>
              <td class="px-3 py-2 border font-mono">{{ result.phi_U_B_deg.toFixed(1) }}</td>
              <td class="px-3 py-2 border font-mono text-green-300">{{ result.I_B_A.toFixed(2) }}</td>
              <td class="px-3 py-2 border font-mono">{{ result.phi_I_B_deg.toFixed(1) }}</td>
            </tr>
            <tr class="bg-gray-900">
              <td class="px-3 py-2 border font-bold">C</td>
              <td class="px-3 py-2 border font-mono text-blue-300">{{ result.U_C_V.toFixed(1) }}</td>
              <td class="px-3 py-2 border font-mono">{{ result.phi_U_C_deg.toFixed(1) }}</td>
              <td class="px-3 py-2 border font-mono text-green-300">{{ result.I_C_A.toFixed(2) }}</td>
              <td class="px-3 py-2 border font-mono">{{ result.phi_I_C_deg.toFixed(1) }}</td>
            </tr>
          </tbody>
        </table>
      </div>


      <div class="mb-4 p-4 bg-gray-800 rounded text-sm" v-if="result.relay_tester_shot">
        <p class="text-gray-300 font-semibold mb-2">继保调试仪建议参数（方向校验）</p>
        <p class="text-gray-400 mb-2">频率 {{ result.relay_tester_shot.frequency_hz }} Hz，故障前保持 {{ result.relay_tester_shot.prefault_hold_s }} s，故障保持 {{ result.relay_tester_shot.fault_hold_s }} s</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div v-for="ch in result.relay_tester_shot.channels" :key="ch.number" class="text-gray-300 font-mono">{{ ch.number }} = {{ ch.magnitude.toFixed(3) }} {{ ch.unit }} ∠{{ ch.angle_deg.toFixed(2) }}°</div>
        </div>
      </div>

      <div class="p-4 bg-gray-800 rounded text-sm">
        <p class="text-gray-400 mb-1">调试台接线与测试要点：</p>
        <ul class="list-disc pl-5 space-y-1 text-gray-300 marker:text-green-400">
          <li>电压通道：A、B、C 分别接装置对应电压端子（注意极性，通常同母线PT同极性）</li>
          <li>电流通道：故障相加流（如 AB 故障则 A、B 相加电流，C 相不加），极性按保护电流方向（母线指向线路）</li>
          <li>本计算使用 AB 相间短路模型推导测量阻抗，若需其他故障类型，请切换"故障类型"再计算</li>
          <li>方向校验时，确保加量后测量阻抗角度位于方向圆内（灵敏度角±90°）才能动作，反向角度应不动作</li>
          <li>动作时间：若满足方向圆和阻抗定值，保护应在 t_set 时间内出口</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { calcDirectionalDistance } from '../../calc/distanceEngine.js'

const system = reactive({
  Un_kV: 110,
  nCT: 600,
  nPT: 1000,
  R1_per_km: 0.4,
  X1_per_km: 1.2,
  RS: 0.5,
  XS: 5.0,
})

const measurement = reactive({
  L_km: 30,
  d_km: 15,
  Rf: 0,
  fault_type: 'AB',
})

const settings = reactive({
  Zset_ohm: 10.0,
  t_set: 0.5,
  theta_sens_deg: -30, // 默认滞后30度
  K_offset: 0.15,
})

const calculating = ref(false)
const result = ref(null)

function runValidation() {
  if (!system.Un_kV || !system.nCT || !system.nPT || measurement.L_km <= 0) {
    alert('请先填写完整且有效的系统参数')
    return
  }

  const d_km = Math.min(Math.max(Number(measurement.d_km) || 0, 0), Number(measurement.L_km))
  measurement.d_km = d_km

  calculating.value = true
  try {
    const res = calcDirectionalDistance({
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
      Zset_ohm: settings.Zset_ohm,
      theta_sens_deg: settings.theta_sens_deg,
      K_offset: settings.K_offset,
      t_set: settings.t_set,
    })
    result.value = res
  } finally {
    calculating.value = false
  }
}

function copyResults() {
  if (!result.value) return
  const r = result.value
  const lines = [
    '方向距离校验结果',
    `测量阻抗 Zm = ${r.Zm_ohm.toFixed(4)} Ω, 角度 = ${r.Zm_angle_deg.toFixed(2)}°`,
    `测量阻抗复数 = ${r.Zm_complex_re?.toFixed?.(4) ?? '-'} + j${r.Zm_complex_im?.toFixed?.(4) ?? '-'} Ω`,
    `定值 Z_set = ${r.Zset_ohm.toFixed(4)} Ω, 灵敏角 = ${r.theta_sens_deg}°, 偏移 = ${r.K_offset}`,
    `方向圆内: ${r.in_circle}, 角度窗口: ${r.in_angle_window}`,
    `动作: ${r.trip ? '是' : '否'}, 时间: ${r.t_action_s !== null ? r.t_action_s.toFixed(3) : '-'} s`,
    '二次输出:',
    `U_A = ${r.U_A_V.toFixed(1)} V (${r.phi_U_A_deg.toFixed(1)}°), I_A = ${r.I_A_A.toFixed(2)} A (${r.phi_I_A_deg.toFixed(1)}°)`,
    `U_B = ${r.U_B_V.toFixed(1)} V (${r.phi_U_B_deg.toFixed(1)}°), I_B = ${r.I_B_A.toFixed(2)} A (${r.phi_I_B_deg.toFixed(1)}°)`,
    `U_C = ${r.U_C_V.toFixed(1)} V (${r.phi_U_C_deg.toFixed(1)}°), I_C = ${r.I_C_A.toFixed(2)} A (${r.phi_I_C_deg.toFixed(1)}°)`,
  ]
  if (r.relay_tester_shot) {
    lines.push(`调试仪参数: f=${r.relay_tester_shot.frequency_hz}Hz, 故障前保持=${r.relay_tester_shot.prefault_hold_s}s, 故障保持=${r.relay_tester_shot.fault_hold_s}s, 预期动作时间=${r.relay_tester_shot.expected_trip_time_s ?? '-'}s`)
    r.relay_tester_shot.channels.forEach(ch => lines.push(`${ch.number}=${ch.magnitude.toFixed(3)}${ch.unit} ∠${ch.angle_deg.toFixed(2)}°`))
  }

  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    alert('结果已复制')
  }).catch(() => alert('复制失败'))
}
</script>

<style scoped>
</style>
