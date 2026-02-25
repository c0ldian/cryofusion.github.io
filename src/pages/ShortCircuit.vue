<template>
  <div class="space-y-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-100">短路电流计算</h1>

    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">输入参数</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="field in fields" :key="field.key">
          <label class="block text-sm font-medium mb-2 text-gray-300">{{ field.label }}</label>
          <input
            type="number"
            :placeholder="field.placeholder"
            v-model="form[field.key]"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-500"
          />
        </div>
      </div>
      <button
        @click="calc"
        class="mt-6 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow transition"
      >
        计算
      </button>
    </div>

    <div v-if="result" class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">计算结果</h2>
        <button
          @click="copyResults"
          :disabled="toast.show"
          class="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded border border-gray-600 transition disabled:opacity-50"
        >
          复制结果
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 bg-blue-900/50 border border-blue-700/30 rounded-xl">
          <p class="text-gray-400 mb-1">三相短路电流 I_k</p>
          <p class="text-3xl font-bold text-blue-400">{{ result.ik.toFixed(3) }} <span class="text-lg">kA</span></p>
        </div>
        <div class="p-4 bg-blue-900/50 border border-blue-700/30 rounded-xl">
          <p class="text-gray-400 mb-1">峰值电流 I_p</p>
          <p class="text-3xl font-bold text-blue-400">{{ result.ip.toFixed(3) }} <span class="text-lg">kA</span></p>
        </div>
      </div>
    </div>

    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">计算原理</h2>
      <div class="prose max-w-none text-gray-300">
        <p>短路电流计算基于标幺值法：</p>
        <p class="my-2 text-lg font-mono text-gray-200"><KaTeX :formula="'I_k = \\frac{S_n}{\\sqrt{3} \\cdot U_n \\cdot (u_k/100)}'" displayMode /></p>
        <ul class="list-disc ml-6 space-y-2">
          <li><strong>S_n</strong>：系统短路容量 (MVA)</li>
          <li><strong>U_n</strong>：系统额定电压 (kV)</li>
          <li><strong>u_k</strong>：阻抗百分比 (%)</li>
        </ul>
        <p class="mt-4 text-gray-300">
          峰值电流取短路电流的 <strong>1.8 倍</strong>（适用于 50Hz 系统）。
        </p>
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
import { reactive, ref } from 'vue'
import KaTeX from '../components/KaTeX.vue'

const form = reactive({
  systemVoltage: '',
  shortCapacity: '',
  impedancePercent: '',
})
const result = ref(null)
const toast = reactive({ show: false, message: '' })

const fields = [
  { key: 'systemVoltage', label: '系统电压 (kV)', placeholder: '10.5' },
  { key: 'shortCapacity', label: '系统短路容量 (MVA)', placeholder: '500' },
  { key: 'impedancePercent', label: '阻抗百分比 (%)', placeholder: '10' },
]

function calc() {
  const V = Number(form.systemVoltage)
  const Sn = Number(form.shortCapacity) * 1e6
  const uk = Number(form.impedancePercent) / 100
  if (!V || !Sn || !uk) return
  const ik = (Sn / (Math.sqrt(3) * V)) / (uk / 100) / 1000
  const ip = 1.8 * ik
  result.value = { ik, ip }
}

function copyResults() {
  if (result.value === null) return
  const text = `短路电流计算:\n三相短路电流 Ik = ${result.value.ik.toFixed(3)} kA\n峰值电流 Ip = ${result.value.ip.toFixed(3)} kA`
  navigator.clipboard.writeText(text).then(() => {
    toast.message = '已复制：短路电流结果'
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