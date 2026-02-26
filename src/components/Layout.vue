<template>
  <div class="flex h-screen bg-gray-950">
    <!-- 侧边栏 -->
    <aside class="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div class="p-4 border-b border-gray-800">
        <h2 class="text-lg font-bold text-gray-100">计算器</h2>
      </div>
      <nav class="flex-1 overflow-y-auto p-2">
        <ul class="space-y-1">
          <li v-for="item in menuItems" :key="item.path">
            <RouterLink :to="item.path" class="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white" :class="{'bg-gray-800 text-white': isActive(item.path)}">
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const menuItems = [
  { path: '/calculators/short-circuit', label: '短路试验计算' },
  { path: '/calculators/distance', label: '距离保护' },
  { path: '/calculators/differential', label: '差动保护' },
  { path: '/calculators/over-current', label: '过流保护' },
  { path: '/calculators/ct-ratio', label: 'CT 变比' },
  { path: '/calculators/pt-ratio', label: 'PT 变比' },
  { path: '/calculators/reclose-time', label: '重合闸时间' },
  { path: '/calculators/sensitivity', label: '灵敏度校验' },
]

function isActive(path) {
  return route.path.startsWith(path)
}
</script>

<style scoped>
</style>
