<template>
  <div class="space-y-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-100">PT 变比计算</h1>

    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">输入参数</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">一次电压 (V/kV)</label>
          <input type="number" v-model="form.primaryVoltage" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">二次电压 (V)</label>
          <select v-model="form.secondaryVoltage" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100">
            <option value="">请选择</option>
            <option value="100">100 V</option>
            <option value="100/√3">100/√3 V (NUC)</option>
          </select>
        </div>
      </div>
      <button @click="calc" class="mt-6 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow transition">计算</button>
    </div>

    <div v-if="result" class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">计算结果</h2>
        <button @click="copyResults" :disabled="toast.show" class="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded border border-gray-600 transition disabled:opacity-50">复制结果</button>
      </div>
      <div class="p-6 bg-blue-900/50 border border-blue-700/30 rounded-xl text-center">
        <p class="text-gray-400 mb-2">PT 变比</p>
        <p class="text-4xl font-bold text-blue-400">{{ result.ratio }}</p>
      </div>
    </div>

    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">计算原理</h2>
      <div class="prose max-w-none text-gray-300">
        <p>PT 变比由一次电压与二次电压之比确定。</p>
        <p class="my-2 text-lg font-mono text-gray-200">常用二次侧电压：100 V 或 100/√3 V（中性点不接地系统）</p>
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

const form = reactive({ primaryVoltage: '', secondaryVoltage: '' })
const result = ref(null)
const toast = reactive({ show: false, message: '' })

function calc() {
  const U1 = Number(form.primaryVoltage)
  const U2 = Number(form.secondaryVoltage)
  if (!U1 || !U2) return
  result.value = { ratio: `${U1}:${U2}` }
}

function copyResults() {
  if (!result.value) return
  const text = `PT 变比计算:\n变比 = ${result.value.ratio}`
  navigator.clipboard.writeText(text).then(() => {
    toast.message = '已复制：PT 变比结果'
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