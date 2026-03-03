<template>
  <div class="space-y-8">
    <!-- Hero -->
    <div class="text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-4 shadow-lg shadow-primary-500/30">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <h1 class="text-3xl md:text-4xl font-bold text-text-primary mb-2">继电保护计算器</h1>
      <p class="text-text-secondary max-w-2xl mx-auto">
        专为电力系统继电保护工程师打造的工具集，支持差动、距离、过流等多种保护校验计算
      </p>
    </div>

    <!-- Beta notice -->
    <div class="bg-accent-500/10 border border-accent-500/30 rounded-xl p-4">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
        <div class="ml-3">
          <p class="text-sm text-accent-200">
            <strong>施工中</strong> — 本网站处于持续开发与测试阶段，计算逻辑和页面设计会持续优化。如有问题欢迎反馈。
          </p>
        </div>
      </div>
    </div>

    <!-- Bento Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <RouterLink
        v-for="item in calculators"
        :key="item.name"
        :to="`/calculators/${item.name}`"
        class="group block bg-surface/90 backdrop-blur rounded-2xl border border-border p-5 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center justify-center w-12 h-12 rounded-xl text-white"
               :class="item.color">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"/>
            </svg>
          </div>
          <svg class="w-5 h-5 text-text-muted group-hover:text-primary-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-text-primary mb-1">{{ item.label }}</h3>
        <p class="text-sm text-text-secondary">{{ item.description }}</p>
        <div class="mt-3 flex items-center text-xs text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>打开计算器</span>
          <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </RouterLink>
    </div>

    <!-- Footer -->
    <div class="text-center pt-6 border-t border-border" :style="{ borderColor: 'rgb(55, 65, 81)' }">
      <p class="text-xs text-text-muted">
        © 2026 Relay Calculator — 专为继电保护工程师打造
      </p>
    </div>
  </div>
</template>

<script>
import { RouterLink } from 'vue-router'

const calculators = [
  {
    name: 'short-circuit',
    label: '短路试验计算',
    description: '主变短路试验电流、电压计算',
    color: 'bg-gradient-to-br from-blue-500 to-blue-700',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z'
  },
  {
    name: 'short-circuit-current',
    label: '短路电流计算',
    description: '一次系统短路电流计算',
    color: 'bg-gradient-to-br from-green-500 to-green-700',
    icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
  },
  {
    name: 'differential',
    label: '差动保护校验',
    description: '变压器差动保护系数计算',
    color: 'bg-gradient-to-br from-purple-500 to-purple-700',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  },
  {
    name: 'distance',
    label: '距离保护',
    description: '距离保护阻抗圆设定',
    color: 'bg-gradient-to-br from-orange-500 to-orange-700',
    icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7'
  },
  {
    name: 'over-current',
    label: '过流保护',
    description: '过流保护定值校验',
    color: 'bg-gradient-to-br from-red-500 to-red-700',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm12-20V9a2 2 0 00-2-2H6a2 2 0 00-2 2v.75c0 1.14.736 2.157 1.784 2.392A3.5 3.5 0 0012 15.25c.866 0 1.703.172 2.447.47C14.698 13 15.5 11.86 15.5 10.75V5.25c0-.69-.564-1.25-1.25-1.25h-3.5c-.686 0-1.25.56-1.25 1.25v1.25'
  },
  {
    name: 'ct-ratio',
    label: 'CT 变比',
    description: '电流互感器变比计算',
    color: 'bg-gradient-to-br from-teal-500 to-teal-700',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
  },
  {
    name: 'pt-ratio',
    label: 'PT 变比',
    description: '电压互感器变比计算',
    color: 'bg-gradient-to-br from-cyan-500 to-cyan-700',
    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
  },
  {
    name: 'reclose-time',
    label: '重合闸时间',
    description: '重合闸时间整定计算',
    color: 'bg-gradient-to-br from-pink-500 to-pink-700',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    name: 'load-angle-verification',
    label: '带负荷相角校验',
    description: '三相电压电流相角与功率因数现场校验',
    color: 'bg-gradient-to-br from-violet-500 to-fuchsia-700',
    icon: 'M13 16h-1v-4h-1m4 4h-1V8h-1m-4 8H8v-6H7m13-3a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    name: 'sensitivity',
    label: '灵敏度校验',
    description: '保护灵敏度校验计算',
    color: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  }
]

export default {
  name: 'Home',
  components: { RouterLink },
  setup() {
    return {
      calculators
    }
  }
}
</script>
