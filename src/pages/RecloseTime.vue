<template>
  <div class="space-y-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-100">自动重合闸时间整定</h1>

    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">输入参数</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="field in fields" :key="field.key">
          <label class="block text-sm font-medium mb-2 text-gray-300" v-html="field.label"></label>
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
      <div class="p-6 bg-blue-900/50 border border-blue-700/30 rounded-xl text-center">
        <p class="text-gray-400 mb-2">重合闸总动作时间 T<sub>out</sub></p>
        <p class="text-4xl font-bold text-blue-400">{{ result.toFixed(2) }} <span class="text-2xl">s</span></p>
      </div>
    </div>

    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">计算原理</h2>
      <div class="prose max-w-none text-gray-300">
        <p>自动重合闸时间整定为保护动作时间、断路器固有分闸时间加上安全裕度：</p>
        <p class="my-2 text-lg font-mono text-gray-200">T<sub>out</sub> = T<sub>prot</sub> + T<sub>breaker</sub> + T<sub>margin</sub></p>
        <p>确保在故障清除后再重合。</p>
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

const form = reactive({ protectionTripTime: '', breakerTime: '', safetyMargin: '' })
const result = ref(null)
const toast = reactive({ show: false, message: '' })

const fields = [
  { key: 'protectionTripTime', label: '保护动作时间 T<sub>prot</sub> (s)', step: '0.01' },
  { key: 'breakerTime', label: '断路器固有分闸时间 T<sub>breaker</sub> (s)', step: '0.01' },
  { key: 'safetyMargin', label: '安全裕度 T<sub>margin</sub> (s)', step: '0.1' },
]

function calc() {
  const Tp = Number(form.protectionTripTime)
  const Tb = Number(form.breakerTime)
  const Ts = Number(form.safetyMargin)
  if (!Tp || !Tb || !Ts) return
  result.value = Tp + Tb + Ts
}

function copyResults() {
  if (result.value === null) return
  const text = `自动重合闸时间整定:\nT_out = ${result.value.toFixed(2)} s`
  navigator.clipboard.writeText(text).then(() => {
    toast.message = '已复制：重合闸时间结果'
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