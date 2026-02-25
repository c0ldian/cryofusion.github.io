<template>
  <div class="space-y-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-100">距离保护阻抗圆</h1>

    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">输入参数</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="field in fields" :key="field.key">
          <label class="block text-sm font-medium mb-2 text-gray-300" v-html="field.label"></label>
          <input
            type="number"
            v-model="form[field.key]"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
          />
        </div>
      </div>
      <button @click="calc" class="mt-6 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow transition">计算</button>
    </div>

    <div v-if="result" class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">计算结果</h2>
        <button @click="copyResults" :disabled="toast.show" class="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded border border-gray-600 transition disabled:opacity-50">复制结果</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 bg-blue-900/50 border border-blue-700/30 rounded-xl">
          <p class="text-gray-400 mb-1">动作阻抗 reach</p>
          <p class="text-3xl font-bold text-blue-400">{{ result.reach }} Ω</p>
        </div>
        <div class="p-4 bg-blue-900/50 border border-blue-700/30 rounded-xl">
          <p class="text-gray-400 mb-1">偏移量 offset</p>
          <p class="text-3xl font-bold text-blue-400">{{ result.offset }} Ω</p>
        </div>
      </div>
    </div>

    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">计算原理</h2>
      <div class="prose max-w-none text-gray-300">
        <p>距离保护通过测量阻抗判断故障位置。当测量阻抗小于整定值时动作。</p>
        <p class="my-2 text-lg font-mono text-gray-200">动作圆特性：|Z| ≤ Z<sub>n</sub></p>
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

const form = reactive({ zn: '', zLine: '' })
const result = ref(null)
const toast = reactive({ show: false, message: '' })

const fields = [
  { key: 'zn', label: '整定阻抗 Z<sub>n</sub> (Ω)' },
  { key: 'zLine', label: '线路阻抗 Z<sub>line</sub> (Ω)' },
]

function calc() {
  const Zn = Number(form.zn)
  const Zline = Number(form.zLine)
  if (!Zn || !Zline) return
  result.value = { reach: Zline, offset: Math.abs(Zn - Zline) }
}

function copyResults() {
  if (!result.value) return
  const text = `距离保护阻抗圆:\n动作阻抗 = ${result.value.reach} Ω\n偏移量 = ${result.value.offset} Ω`
  navigator.clipboard.writeText(text).then(() => {
    toast.message = '已复制：距离保护结果'
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