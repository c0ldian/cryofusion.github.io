<template>
  <div class="space-y-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-100">过流保护整定计算</h1>

    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">输入参数</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="field in fields" :key="field.key">
          <label class="block text-sm font-medium mb-2 text-gray-300">{{ field.label }}</label>
          <input
            type="number"
            :step="field.step"
            v-model="form[field.key]"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
          />
        </div>
      </div>
      <button @click="calc" class="mt-6 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow transition">计算</button>
    </div>

    <div v-if="result !== null" class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">计算结果</h2>
        <button @click="copyResults" :disabled="toast.show" class="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded border border-gray-600 transition disabled:opacity-50">复制结果</button>
      </div>
      <div class="p-6 bg-blue-900/50 border border-blue-700/30 rounded-xl text-center mb-6">
        <p class="text-gray-400 mb-2">过流保护启动电流 I<sub>op</sub></p>
        <p class="text-4xl font-bold text-blue-400">{{ result.toFixed(2) }} <span class="text-2xl">A</span></p>
      </div>

      <!-- 校验参数配置 -->
      <div class="border-t border-gray-700 pt-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-200">校验参数配置</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-300">不动作系数</label>
            <input type="number" step="0.01" v-model.number="testConfig.nonActCoeff" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-300">动作系数</label>
            <input type="number" step="0.01" v-model.number="testConfig.actCoeff" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-300">超动系数</label>
            <input type="number" step="0.01" v-model.number="testConfig.overActCoeff" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-300">加量保持时间 (s)</label>
            <input type="number" step="0.1" v-model.number="testConfig.holdTime" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
          </div>
        </div>

        <div class="flex items-center mb-4">
          <input type="checkbox" v-model="testConfig.directionalEnabled" class="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-600" />
          <label class="ml-2 text-sm font-medium text-gray-300">启用方向过流校验</label>
        </div>

        <div class="grid grid-cols-2 gap-4" v-if="testConfig.directionalEnabled">
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-300">反向不动作系数</label>
            <input type="number" step="0.1" v-model.number="testConfig.revNonActCoeff" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-300">反向加量保持时间 (s)</label>
            <input type="number" step="0.1" v-model.number="testConfig.revHoldTime" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
          </div>
        </div>

        <div class="mt-4 flex gap-3">
          <button @click="copyTestPlan" :disabled="toast.show" class="text-sm bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded border transition disabled:opacity-50">复制校验模板</button>
          <button @click="copyTestPlanInline" v-if="false" class="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded border transition">复制简化流程</button>
        </div>
      </div>
    </div>

    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">计算原理</h2>
      <div class="prose max-w-none text-gray-300">
        <p>过流保护整定电流：</p>
        <p class="my-2 text-lg font-mono text-gray-200">I<sub>op</sub> = K<sub>rel</sub> × K<sub>re</sub> × I<sub>load</sub></p>
        <ul class="list-disc ml-6 space-y-2">
          <li><strong>K<sub>rel</sub></strong>：可靠系数（通常 1.2~1.3）</li>
          <li><strong>K<sub>re</sub></strong>：返回系数（通常 0.85~0.95）</li>
        </ul>
      </div>
    </div>

    <!-- Toast 提示 -->
    <transition name="fade">
      <div v-if="toast.show" class="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50">
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'

const form = reactive({
  loadCurrent: '',
  reliabilityCoeff: '',
  returnCoeff: '',
})
const result = ref(null)
const toast = reactive({ show: false, message: '' })

// 校验配置
const testConfig = reactive({
  nonActCoeff: 0.95,
  actCoeff: 1.00,
  overActCoeff: 1.05,
  holdTime: 10,
  directionalEnabled: false,
  revNonActCoeff: 1.20,
  revHoldTime: 10,
})

const fields = [
  { key: 'loadCurrent', label: '负荷电流 (A)' },
  { key: 'reliabilityCoeff', label: '可靠系数', step: '0.1' },
  { key: 'returnCoeff', label: '返回系数', step: '0.1' },
]

function calc() {
  const Iload = Number(form.loadCurrent)
  const Kre = Number(form.reliabilityCoeff)
  const Kr = Number(form.returnCoeff)
  if (!Iload || !Kre || !Kr) return
  result.value = Kre * Kr * Iload
}

function copyResults() {
  if (result.value === null) return
  const text = `过流保护整定计算:\n启动电流 Iop = ${result.value.toFixed(2)} A`
  navigator.clipboard.writeText(text).then(() => {
    toast.message = '已复制：过流保护结果'
    toast.show = true
    setTimeout(() => { toast.show = false }, 2000)
  }).catch((err) => {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制')
  })
}

// 复制校验模板
function copyTestPlan() {
  if (!result.value) return
  const Iop = result.value
  const nonAct = (Iop * testConfig.nonActCoeff).toFixed(2)
  const act = (Iop * testConfig.actCoeff).toFixed(2)
  const overAct = (Iop * testConfig.overActCoeff).toFixed(2)
  const holdTime = testConfig.holdTime

  let text = `【过流保护现场校验记录】

装置名称：_________
校验人员：_________
日期：_________

保护定值：
- 启动电流 Iop = ${Iop.toFixed(2)} A

校验参数：
- 不动作系数：${testConfig.nonActCoeff} → 不动作值 = ${nonAct} A
- 动作系数：${testConfig.actCoeff} → 动作值 = ${act} A
- 超动系数：${testConfig.overActCoeff} → 超动值 = ${overAct} A
- 加量保持时间：${holdTime} 秒

校验步骤：
1. 不动作试验：
   - 加量至 ${nonAct} A
   - 保持 ${holdTime} 秒
   - 预期：保护不动作

2. 动作试验：
   - 加量至 ${act} A
   - 记录动作时间
   - 预期：保护动作，时间符合整定值

3. 超动试验：
   - 加量至 ${overAct} A
   - 保持 ${holdTime} 秒
   - 预期：保护可靠动作

`

  if (testConfig.directionalEnabled) {
    const revNonAct = (Iop * testConfig.revNonActCoeff).toFixed(2)
    const revHold = testConfig.revHoldTime
    text += `方向保护校验：
4. 反向不动作试验：
   - 加量至 ${revNonAct} A
   - 保持 ${revHold} 秒
   - 预期：保护不动作

`
  }

  text += `记录：
□ 所有校验通过
□ 需整改项目：_________

备注：_________`

  navigator.clipboard.writeText(text).then(() => {
    toast.message = '已复制：校验模板'
    toast.show = true
    setTimeout(() => { toast.show = false }, 2000)
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