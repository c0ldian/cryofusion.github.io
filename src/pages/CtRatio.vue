<template>
  <div class="space-y-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-100">CT 变比与误差</h1>

    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">输入参数</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">一次电流 (A)</label>
          <input type="number" v-model="form.primaryCurrent" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">二次电流 (A)</label>
          <select v-model="form.secondaryCurrent" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100">
            <option value="">请选择</option>
            <option value="1">1 A</option>
            <option value="5">5 A</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">准确级</label>
          <select v-model="form.accuracyClass" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100">
            <option value="">请选择</option>
            <option value="10P20">10P20</option>
            <option value="5P20">5P20</option>
            <option value="10P10">10P10</option>
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
      <div class="space-y-4">
        <div class="p-4 bg-blue-900/50 border border-blue-700/30 rounded-xl">
          <p class="text-gray-400 mb-1">CT 变比</p>
          <p class="text-3xl font-bold text-blue-400">{{ result.ratio }}</p>
        </div>
        <div v-if="result.burden > 0" class="p-4 bg-green-900/30 border border-green-700/30 rounded-xl">
          <p class="text-gray-400 mb-1">建议二次负荷</p>
          <p class="text-3xl font-bold text-green-400"><= {{ result.burden }} VA</p>
        </div>
      </div>
    </div>

    <div class="bg-gray-900 rounded-xl shadow-lg p-4 md:p-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-200">计算原理</h2>
      <div class="prose max-w-none text-gray-300">
        <p>CT 变比由一次电流与二次电流之比确定。</p>
        <p class="my-2 text-lg font-mono text-gray-200">准确级（如 10P20）表示在 20 倍额定电流下误差不超过 10%。</p>
        <p>实际使用时需确保二次负荷不超过准确级允许的最大负荷。</p>
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

const form = reactive({ primaryCurrent: '', secondaryCurrent: '', accuracyClass: '' })
const result = ref(null)
const toast = reactive({ show: false, message: '' })

function calc() {
  const I1 = Number(form.primaryCurrent)
  const I2 = Number(form.secondaryCurrent)
  if (!I1 || !I2) return
  const ratio = `${I1}:${I2}`
  let burden = 0
  if (form.accuracyClass === '10P20') burden = 25
  else if (form.accuracyClass === '5P20') burden = 15
  else if (form.accuracyClass === '10P10') burden = 15
  result.value = { ratio, burden }
}

function copyResults() {
  if (!result.value) return
  const burdenText = result.value.burden > 0 ? `\n建议二次负荷 <= ${result.value.burden} VA` : ''
  const text = `CT 变比计算:\n变比 = ${result.value.ratio}${burdenText}`
  navigator.clipboard.writeText(text).then(() => {
    toast.message = '已复制：CT 变比结果'
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