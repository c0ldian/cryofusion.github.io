<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-100">欢迎使用继保计算器</h1>

    <div class="bg-yellow-900/30 border border-yellow-700 rounded-xl p-6">
      <h2 class="text-xl font-semibold text-yellow-400 mb-2">🚧 施工中公告</h2>
      <p class="text-gray-300 mb-2">
        本网站目前处于 <strong>持续开发与测试阶段</strong>。页面内容、计算逻辑、校验方案等可能会随时调整。
      </p>
      <p class="text-gray-300 mb-2">
        如遇到计算异常、页面卡顿或显示错误，请及时反馈。你的使用帮助我发现问题、改进代码。
      </p>
      <p class="text-gray-300">
        感谢耐心。完成后将提供更完整、更稳定的服务。
      </p>
    </div>

    <div class="bg-gray-900 rounded-xl p-6">
      <h2 class="text-xl font-semibold text-gray-200 mb-4">快速导航</h2>
      <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <li v-for="item in navItems" :key="item.name">
          <RouterLink :to="`/calculators/${item.name}`" class="block p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition">
            {{ item.label }}
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const navItems = [
  { name: 'short-circuit', label: '短路试验计算' },
  { name: 'short-circuit-current', label: '短路电流' },
  { name: 'over-current', label: '过流保护' },
  { name: 'distance', label: '距离保护' },
  { name: 'differential', label: '差动保护' },
  { name: 'ct-ratio', label: 'CT 变比' },
  { name: 'pt-ratio', label: 'PT 变比' },
  { name: 'reclose-time', label: '重合闸时间' },
  { name: 'sensitivity', label: '灵敏度校验' },
]
</script>
