<template>
  <div class="space-y-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-100">相间距离校验</h1>

    <!-- 主变/线路参数 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">线路与测量配置</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">线路单位阻抗 Z' (Ω/km)</label>
          <input type="number" step="0.01" v-model.number="params.lineImpedancePerKm" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">线路总长 L (km)</label>
          <input type="number" step="0.1" v-model.number="params.lineLength" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">测量点位置 x (km)</label>
          <input type="number" step="0.1" v-model.number="params.measurementPoint" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">故障类型</label>
          <select v-model="params.faultType" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100">
            <option value="AB">AB 相短路</option>
            <option value="BC">BC 相短路</option>
            <option value="CA">CA 相短路</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">电压二次额定 (V)</label>
          <input type="number" step="1" v-model.number="params.uSecondary" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">电流二次额定 (A)</label>
          <input type="number" step="0.1" v-model.number="params.iSecondary" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
      </div>
    </div>

    <!-- 整定参数 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">整定参数</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">阻抗整定值 Z_set (Ω)</label>
          <input type="number" step="0.01" v-model.number="settings.zSet" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">动作时间 t_set (s)</label>
          <input type="number" step="0.01" v-model.number="settings.timeSet" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">灵敏角 θ_sens (°)</label>
          <input type="number" step="1" v-model.number="settings.thetaSens" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
      </div>
    </div>

    <!-- 校验按钮 -->
    <button @click="runValidation" :disabled="calculating" class="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-900 text-white font-bold py-4 px-8 rounded-lg shadow transition flex items-center justify-center gap-2">
      <span v-if="calculating">生成中...</span>
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
              <th class="px-3 py-2 border">序号</th>
              <th class="px-3 py-2 border">故障类型</th>
              <th class="px-3 py-2 border">U_A (V/°)</th>
              <th class="px-3 py-2 border">U_B (V/°)</th>
              <th class="px-3 py-2 border">U_C (V/°)</th>
              <th class="px-3 py-2 border">I_A (A/°)</th>
              <th class="px-3 py-2 border">I_B (A/°)</th>
              <th class="px-3 py-2 border">I_C (A/°)</th>
              <th class="px-3 py-2 border">Z_meas (Ω)</th>
              <th class="px-3 py-2 border">动作</th>
              <th class="px-3 py-2 border">理论时间 (s)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in results" :key="idx" :class="row.operate ? 'bg-green-900/20' : 'bg-red-900/10'">
              <td class="px-3 py-2 border text-center">{{ idx + 1 }}</td>
              <td class="px-3 py-2 border text-center">{{ row.faultType }}</td>
              <td class="px-3 py-2 border text-center font-mono text-blue-300">{{ row.U_a }}</td>
              <td class="px-3 py-2 border text-center font-mono text-blue-300">{{ row.U_b }}</td>
              <td class="px-3 py-2 border text-center font-mono text-blue-300">{{ row.U_c }}</td>
              <td class="px-3 py-2 border text-center font-mono text-green-300">{{ row.I_a }}</td>
              <td class="px-3 py-2 border text-center font-mono text-green-300">{{ row.I_b }}</td>
              <td class="px-3 py-2 border text-center font-mono text-green-300">{{ row.I_c }}</td>
              <td class="px-3 py-2 border text-center font-mono">{{ row.zMeas.toFixed(4) }}</td>
              <td class="px-3 py-2 border text-center font-bold" :class="row.operate ? 'text-green-400' : 'text-red-400'">{{ row.operate ? '动作' : '不动作' }}</td>
              <td class="px-3 py-2 border text-center">{{ row.time.toFixed(3) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-4 p-4 bg-gray-800 rounded text-sm">
        <p class="text-gray-400 mb-1">调试台接线建议：</p>
        <p class="text-gray-300">- 电压通道：A/B/C 对应调试台三路电压输出</p>
        <p class="text-gray-300">- 电流通道：A/B 为故障相电流，C 为 0（非故障相不输出）</p>
        <p class="text-gray-300">- 相位：两相短路时，故障相电压对称，电流超前/滞后取决于线路阻抗角；可先用一条线路实测数据作为参考</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const params = reactive({
  lineImpedancePerKm: 0.4,   // Ω/km
  lineLength: 30,            // km
  measurementPoint: 15,      // km，默认中点
  faultType: 'AB',
  uSecondary: 100,           // V
  iSecondary: 5,             // A
})

const settings = reactive({
  zSet: 10,       // Ω
  timeSet: 0.5,   // s
  thetaSens: -30, // °
})

const calculating = ref(false)
const results = ref([])

function runValidation() {
  calculating.value = true
  try {
    const Z_line_total = params.lineImpedancePerKm * params.lineLength
    const Z_meas = params.lineImpedancePerKm * params.measurementPoint  // 简化：测量点到故障点阻抗等于测量点到首端阻抗

    // 生成三相电压电流，基于 AB 故障示例
    const seq = []
    const fault = params.faultType
    const U_ph = params.uSecondary
    const I_fault = (Z_meas > 0) ? (U_ph / Z_meas) : 0  // 简单估算，实际应考虑系统阻抗
    const I_sec = Math.min(I_fault, params.iSecondary * 2) // 限制一下

    // 角度：线路阻抗角约 70°，电流滞后电压
    const theta_Line = 70
    const deg2rad = Math.PI / 180

    // 生成对称分量，简化：直接给三相
    const entries = []
    const types = [fault]
    types.forEach(type => {
      // U_A 为参考 0°
      const Ua = { mag: U_ph, ang: 0 }
      let Ub, Uc, Ia, Ib, Ic
      if (type === 'AB') {
        Ub = { mag: U_ph, ang: -120 }
        Uc = { mag: 0, ang: 0 }
        Ia = { mag: I_sec, ang: -theta_Line }
        Ib = { mag: I_sec, ang: -theta_Line - 120 }
        Ic = { mag: 0, ang: 0 }
      } else if (type === 'BC') {
        Ub = { mag: U_ph, ang: -120 }
        Uc = { mag: U_ph, ang: 120 }
        Ia = { mag: 0, ang: 0 }
        Ib = { mag: I_sec, ang: -theta_Line }
        Ic = { mag: I_sec, ang: -theta_Line - 120 }
      } else { // CA
        Uc = { mag: U_ph, ang: 120 }
        Ua = { mag: U_ph, ang: 0 }
        Ia = { mag: I_sec, ang: -theta_Line - 120 }
        Ib = { mag: 0, ang: 0 }
        Ic = { mag: I_sec, ang: -theta_Line }
      }

      const operate = Z_meas <= settings.zSet
      const time = operate ? settings.timeSet : 0

      entries.push({
        faultType: type,
        U_a: `${Ua.mag.toFixed(1)}/${Ua.ang}°`,
        U_b: `${Ub ? Ub.mag.toFixed(1) : 0}/${Ub ? Ub.ang : 0}°`,
        U_c: `${Uc ? Uc.mag.toFixed(1) : 0}/${Uc ? Uc.ang : 0}°`,
        I_a: `${Ia.mag.toFixed(2)}/${Ia.ang}°`,
        I_b: `${Ib ? Ib.mag.toFixed(2) : 0}/${Ib ? Ib.ang : 0}°`,
        I_c: `${Ic ? Ic.mag.toFixed(2) : 0}/${Ic ? Ic.ang : 0}°`,
        zMeas: Z_meas,
        operate,
        time,
      })
    })

    results.value = entries
  } finally {
    calculating.value = false
  }
}

function copyResults() {
  if (!results.value.length) return
  const header = '序号,故障类型,U_A (V/°),U_B (V/°),U_C (V/°),I_A (A/°),I_B (A/°),I_C (A/°),Z_meas (Ω),动作,理论时间 (s)'
  const rows = results.value.map((r, i) =>
    `${i+1},${r.faultType},${r.U_a},${r.U_b},${r.U_c},${r.I_a},${r.I_b},${r.I_c},${r.zMeas.toFixed(4)},${r.operate ? '动作' : '不动作'},${r.time.toFixed(3)}`
  )
  const text = [header, ...rows].join('\n')
  navigator.clipboard.writeText(text).then(() => {
    alert('复制成功')
  }).catch(() => alert('复制失败'))
}
</script>

<style scoped>
</style>
