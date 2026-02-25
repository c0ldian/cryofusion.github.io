<template>
  <div class="space-y-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-100">灵敏度校验</h1>

    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">输入参数</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">最小短路电流 I_min (A)</label>
          <input type="number" v-model="form.minShortCurrent" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">保护整定值 I_op (A)</label>
          <input type="number" v-model="form.protectionSetting" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
      </div>
      <button @click="calc" class="mt-6 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow transition">计算</button>
    </div>

    <div v-if="result !== null" class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-200">计算结果</h2>
        <button @click="copyResults" :disabled="toast.show" class="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded border border-gray-600 transition disabled:opacity-50">复制结果</button>
      </div>
      <div :class="['p-6 rounded-xl border', result >= 1.5 ? 'bg-green-900/30 border-green-700/30' : 'bg-red-900/30 border-red-700/30']">
        <p class="text-gray-400 mb-2">灵敏度系数 K_sen</p>
        <p :class="['text-4xl font-bold', result >= 1.5 ? 'text-green-400' : 'text-red-400']">
          {{ result.toFixed(3) }}
          <span class="text-2xl ml-2">{{ result >= 1.5 ? '✓ 满足要求' : '✗ 不足' }}</span>
        </p>
      </div>
    </div>

    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">计算原理</h2>
      <div class="prose max-w-none text-gray-300">
        <p>灵敏度校验：最小短路电流与保护启动值之比。</p>
        <p class="my-2 text-lg font-mono text-gray-200"><KaTeX :formula="'K_{sen} = \\frac{I_{min}}{I_{op}}'" displayMode /></p>
        <p>一般要求 K_sen ≥ 1.5（过流保护）或满足规程最低灵敏度要求。</p>
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

const form = reactive({ minShortCurrent: '', protectionSetting: '' })
const result = ref(null)
const toast = reactive({ show: false, message: '' })

function calc() {
  const Imin = Number(form.minShortCurrent)
  const Iop = Number(form.protectionSetting)
  if (!Imin || !Iop) return
  result.value = Imin / Iop
}

function copyResults() {
  if (result.value === null) return
  const status = result.value >= 1.5 ? '满足要求' : '不足'
  const text = `灵敏度校验:\nKsen = ${result.value.toFixed(3)} (${status})`
  navigator.clipboard.writeText(text).then(() => {
    toast.message = '已复制：灵敏度结果'
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