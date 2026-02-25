<template>
  <div class="space-y-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-100">比率制动差动保护校验</h1>

    <!-- 主变参数 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">主变参数</h2>
        <button @click="fillExample" class="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded border transition">填入示例</button>
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
          <input type="text" placeholder="如 1200/5" v-model="transformer.params.ctRatios.lv" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
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
          <button @click="fillDefaults" class="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded border transition">一键填入</button>
          <button @click="clearAll" class="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded border transition">一键清空</button>
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
        <p class="text-gray-300 font-mono">I<sub>res</sub> &lt; I<sub>break</sub>：I<sub>diff</sub> &gt; Id_min + k1×I<sub>res</sub></p>
        <p class="text-gray-300 font-mono">I<sub>res</sub> ≥ I<sub>break</sub>：I<sub>diff</sub> &gt; Id_min + k2×(I<sub>res</sub>−I<sub>break</sub>)</p>
      </div>
    </div>

    <!-- 测试序列 -->
    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">测试序列（高压侧单相加流）</h2>
      </div>
      <div class="mb-2 text-sm text-gray-300">
        序列基于 I<sub>break</sub> 自动生成：0.5×I<sub>break</sub> → 3×I<sub>break</sub>，步长 0.5×I<sub>break</sub>
      </div>
      <div class="p-3 bg-blue-900/30 border border-blue-700/30 rounded font-mono text-blue-200">
        {{ testSequenceDisplay }}
      </div>
    </div>

    <!-- 校验结果 -->
    <div v-if="calcStore.results" class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">校验结果</h2>
        <button @click="copyTestPlan" class="text-sm bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded border transition">复制校验模板</button>
      </div>

      <div class="overflow-x-auto mb-6">
        <table class="min-w-full text-sm text-gray-300">
          <thead class="bg-gray-800">
            <tr>
              <th class="px-4 py-3 text-left">序号</th>
              <th class="px-4 py-3 text-left">I<sub>res</sub> (A)</th>
              <th class="px-4 py-3 text-left">I<sub>diff</sub> (A)</th>
              <th class="px-4 py-3 text-left">I<sub>diff</sub> 整定值 (A)</th>
              <th class="px-4 py-3 text-left">动作</th>
              <th class="px-4 py-3 text-left">区域</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in calcStore.results.table" :key="idx" :class="row.operate ? 'bg-green-900/20' : 'bg-red-900/10'">
              <td class="px-4 py-3">{{ idx + 1 }}</td>
              <td class="px-4 py-3">{{ row.I_res.toFixed(2) }}</td>
              <td class="px-4 py-3">{{ row.I_diff.toFixed(2) }}</td>
              <td class="px-4 py-3 font-mono text-blue-300">{{ row.Id_set.toFixed(4) }}</td>
              <td class="px-4 py-3 font-mono">{{ row.operate ? '动作' : '不动作' }}</td>
              <td class="px-4 py-3">{{ row.region === 1 ? '启动区' : '比率区' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="p-3 bg-gray-800 rounded text-sm">
        <p class="text-gray-400 mb-1">折算系数说明：</p>
        <p>HV→装置：K = 1.000</p>
        <p>LV→装置：K = {{ calcStore.results.factors.lv.toFixed(4) }}</p>
      </div>
    </div>

    <!-- 特性曲线 -->
    <DiffChart />

    <!-- 校验模板复制 -->
    <div v-if="calcStore.results" class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">校验模板</h2>
        <button @click="copyTestPlan" :disabled="toast.show" class="text-sm bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded border transition disabled:opacity-50">复制完整模板</button>
      </div>
      <p class="text-sm text-gray-400">包含：整定参数、校验点表、步骤说明、记录栏。</p>
    </div>

    <!-- 全局错误提示 -->
    <div v-if="calcStore.errors.length" class="bg-red-900/30 border border-red-700 rounded-lg p-4">
      <h3 class="text-red-400 font-semibold mb-2">请检查以下问题：</h3>
      <ul class="list-disc pl-5 space-y-1 text-red-300 text-sm">
        <li v-for="(err, idx) in calcStore.errors" :key="idx">{{ err }}</li>
      </ul>
    </div>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toast.show" class="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50">
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useTransformerStore } from '../store/transformerStore'
import { useCalculationStore } from '../store/calculationStore'
import { roundTo } from '../utils/unitConverter'

const transformer = useTransformerStore()
const calcStore = useCalculationStore()
const toast = ref({ show: false, message: '' })

const deviceFactor = computed(() => transformer.params.deviceConfig === 'delta-to-wye' ? 1 / Math.sqrt(3) : Math.sqrt(3))

const testSequenceDisplay = computed(() => {
  return (calcStore.testCurrents || []).map(c => c.toFixed(2)).join(' A ｜ ')
})

function fillExample() {
  transformer.params.capacity = 50
  transformer.params.voltages = { hv: 110, lv: 10 }
  transformer.params.ctRatios = { hv: '600/5', lv: '1200/5' }
  transformer.params.windingConnection = { hv: 'Y', lv: 'D' }
  transformer.params.clockNumbers = { hv: 0, lv: 11 }
  transformer.params.deviceConfig = 'delta-to-wye'
}

function clearAll() {
  transformer.params.capacity = ''
  transformer.params.voltages = { hv: '', lv: '' }
  transformer.params.ctRatios = { hv: '', lv: '' }
  calcStore.settings.Id_min = ''
  calcStore.settings.I_break = ''
  calcStore.settings.k1 = ''
  calcStore.settings.k2 = ''
}

function copyTestPlan() {
  if (!calcStore.results) return
  const { table, factors } = calcStore.results
  const { Id_min, I_break, k1, k2 } = calcStore.settings

  let text = `【差动保护校验记录（两绕组）】

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
${table.map((r, i) => `${i+1} | ${r.I_res.toFixed(2)} | ${r.I_diff.toFixed(2)} | ${r.Id_set.toFixed(4)} | ${r.operate ? '动作' : '不动作'}`).join('\n')}

校验步骤：
1. 按 I_break 的 0.5~3 倍设置制动电流（高压侧）
2. 每点先加至 0.95×I_res 检查不动作
3. 再加至测试点 I_diff，记录动作情况
4. 通过标准：误差 ≤ ±5%

记录：
□ 校验通过
□ 需整改：_________

备注：_________`

  navigator.clipboard.writeText(text).then(() => {
    toast.value.message = '已复制：校验模板'
    toast.value.show = true
    setTimeout(() => { toast.value.show = false }, 2000)
  }).catch((err) => {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制')
  })
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>