<template>
  <div class="space-y-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-100">方向距离校验</h1>

    <!-- 线路与测量配置 -->
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
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">阻抗整定值 Z_set (Ω)</label>
          <input type="number" step="0.01" v-model.number="settings.zSet" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">动作时间 t_set (s)</label>
          <input type="number" step="0.01" v-model.number="settings.timeSet" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">方向特性</label>
          <select v-model="settings.directionType" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100">
            <option value="circle">方向阻抗圆</option>
            <option value="offset">偏移特性</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">灵敏角 θ_sens (°)</label>
          <input type="number" step="1" v-model.number="settings.thetaSens" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">偏移系数 K_offset (仅偏移特性)</label>
          <input type="number" step="0.01" v-model.number="settings.kOffset" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div></div>
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
              <th class="px-3 py-2 border">试验类型</th>
              <th class="px-3 py-2 border">U_A (V/°)</th>
              <th class="px-3 py-2 border">U_B (V/°)</th>
              <th class="px-3 py-2 border">U_C (V/°)</th>
              <th class="px-3 py-2 border">I_A (A/°)</th>
              <th class="px-3 py-2 border">I_B (A/°)</th>
              <th class="px-3 py-2 border">I_C (A/°)</th>
              <th class="px-3 py-2 border">Z_meas (Ω)</th>
              <th class="px-3 py-2 border">方向</th>
              <th class="px-3 py-2 border">动作</th>
              <th class="px-3 py-2 border">理论时间 (s)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in results" :key="idx" :class="row.operate ? 'bg-green-900/20' : 'bg-red-900/10'">
              <td class="px-3 py-2 border text-center">{{ idx + 1 }}</td>
              <td class="px-3 py-2 border text-center">{{ row.testType }}</td>
              <td class="px-3 py-2 border text-center font-mono text-blue-300">{{ row.U_a }}</td>
              <td class="px-3 py-2 border text-center font-mono text-blue-300">{{ row.U_b }}</td>
              <td class="px-3 py-2 border text-center font-mono text-blue-300">{{ row.U_c }}</td>
              <td class="px-3 py-2 border text-center font-mono text-green-300">{{ row.I_a }}</td>
              <td class="px-3 py-2 border text-center font-mono text-green-300">{{ row.I_b }}</td>
              <td class="px-3 py-2 border text-center font-mono text-green-300">{{ row.I_c }}</td>
              <td class="px-3 py-2 border text-center font-mono">{{ row.zMeas.toFixed(4) }}</td>
              <td class="px-3 py-2 border text-center" :class="row.directionCorrect ? 'text-green-400' : 'text-red-400'">{{ row.directionCorrect ? '正确' : '反向' }}</td>
              <td class="px-3 py-2 border text-center font-bold" :class="row.operate ? 'text-green-400' : 'text-red-400'">{{ row.operate ? '动作' : '不动作' }}</td>
              <td class="px-3 py-2 border text-center">{{ row.time.toFixed(3) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-4 p-4 bg-gray-800 rounded text-sm">
        <p class="text-gray-400 mb-1">调试台接线与操作：</p>
        <p class="text-gray-300">- 电压通道 A/B/C：分别接调试台三路电压输出</p>
        <p class="text-gray-300">- 电流通道 A/B：故障相电流输出；C 相为 0</p>
        <p class="text-gray-300">- 正向测试：U 与 I 同相（相对角 ≈ 0°），且 |Z_meas| = Z_set 时应动作</p>
        <p class="text-gray-300">- 反向测试：U 与 I 相位差 180°+θ_sens，|Z_meas| = Z_set 时应不动作</p>
        <p class="text-gray-300 text-red-400">注意：调整相位时，若使用调试仪的“角度”设置，确保角度增量正确；若使用复数合成，直接设置 U/I 的相位角。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const params = reactive({
  lineImpedancePerKm: 0.4,
  lineLength: 30,
  measurementPoint: 15,
  faultType: 'AB',
  uSecondary: 100,
  iSecondary: 5,
})

const settings = reactive({
  zSet: 10,
  timeSet: 0.5,
  directionType: 'circle',
  thetaSens: -30,
  kOffset: 0.15,
})

const calculating = ref(false)
const results = ref([])

function runValidation() {
  calculating.value = true
  try {
    const Z_meas = params.lineImpedancePerKm * params.measurementPoint
    const U_ph = params.uSecondary
    const theta_line = 70 // 线路阻抗角典型值，度
    const I_sec = U_ph / Z_meas / 2 // 粗略拟合到二次范围
    const I_fault = Math.min(I_sec, params.iSecondary)

    const tests = []

    // 正向测试：U/I 同相，阻抗 Z_meas = Z_set 时应动作
    // 构建 AB 故障为例
    const fa = (mag, ang) => `${mag.toFixed(1)}/${ang}°`
    const Ia_ang = 0 // U_A 为 0°，同相
    const Ib_ang = -120 + (0 - (-theta_Line)) // 保持电流滞后电压，但整体旋转使与对应电压同相
    // 简化：正向时，U_A 0°, I_A 0°; U_B -120°, I_B -120°
    const Ua = { mag: U_ph, ang: 0 }
    const Ub = { mag: U_ph, ang: -120 }
    const Uc = { mag: 0, ang: 0 }
    const Ia = { mag: I_fault, ang: 0 }
    const Ib = { mag: I_fault, ang: -120 }
    const Ic = { mag: 0, ang: 0 }

    tests.push({
      testType: '正向边界',
      U_a: fa(Ua.mag, Ua.ang),
      U_b: fa(Ub.mag, Ub.ang),
      U_c: fa(Uc.mag, Uc.ang),
      I_a: fa(Ia.mag, Ia.ang),
      I_b: fa(Ib.mag, Ib.ang),
      I_c: fa(Ic.mag, Ic.ang),
      zMeas: Z_meas,
      directionCorrect: true,
      operate: Z_meas <= settings.zSet,
      time: Z_meas <= settings.zSet ? settings.timeSet : 0,
    })

    // 反向测试：U/I 相差 180°+θ_sens
    // 反向时，电流相位整体反转，并加上灵敏角偏移
    const rev_ang_offset = 180 + settings.thetaSens
    const Ua_rev = { mag: U_ph, ang: 0 }
    const Ub_rev = { mag: U_ph, ang: -120 }
    const Ia_rev = { mag: I_fault, ang: rev_ang_offset }
    const Ib_rev = { mag: I_fault, ang: -120 + rev_ang_offset }

    tests.push({
      testType: '反向边界',
      U_a: fa(Ua_rev.mag, Ua_rev.ang),
      U_b: fa(Ub_rev.mag, Ub_rev.ang),
      U_c: fa(0, 0),
      I_a: fa(Ia_rev.mag, Ia_rev.ang),
      I_b: fa(Ib_rev.mag, Ib_rev.ang),
      I_c: fa(0, 0),
      zMeas: Z_meas,
      directionCorrect: false,
      operate: false, // 反向不应动作
      time: 0,
    })

    results.value = tests
  } finally {
    calculating.value = false
  }
}

function copyResults() {
  if (!results.value.length) return
  const header = '序号,试验类型,U_A (V/°),U_B (V/°),U_C (V/°),I_A (A/°),I_B (A/°),I_C (A/°),Z_meas (Ω),方向,动作,理论时间 (s)'
  const rows = results.value.map((r, i) =>
    `${i+1},${r.testType},${r.U_a},${r.U_b},${r.U_c},${r.I_a},${r.I_b},${r.I_c},${r.zMeas.toFixed(4)},${r.directionCorrect ? '正确' : '反向'},${r.operate ? '动作' : '不动作'},${r.time.toFixed(3)}`
  )
  const text = [header, ...rows].join('\n')
  navigator.clipboard.writeText(text).then(() => {
    alert('复制成功')
  }).catch(() => alert('复制失败'))
}
</script>

<style scoped>
</style>
