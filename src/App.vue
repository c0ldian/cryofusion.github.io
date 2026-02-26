<script setup>
import { ref, computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const collapsed = ref(false)
const mobileOpen = ref(false)
const route = useRoute()

// 构建时间（注入）
const buildTime = __BUILD_TIME__

const navItems = [
  { name: 'short-circuit', label: '短路电流' },
  { name: 'over-current', label: '过流保护' },
  { name: 'distance', label: '距离保护' },
  { name: 'differential', label: '差动保护' },
  { name: 'ct-ratio', label: 'CT 变比' },
  { name: 'pt-ratio', label: 'PT 变比' },
  { name: 'reclose-time', label: '重合闸时间' },
  { name: 'sensitivity', label: '灵敏度校验' },
]

function isActive(item) {
  return route.path.endsWith(`/calculators/${item.name}`) || (route.path === '/' && item.name === 'short-circuit')
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-950 text-gray-100">
    <!-- 移动端遮罩 -->
    <div v-if="mobileOpen" class="fixed inset-0 bg-black/70 z-40 md:hidden" @click="mobileOpen=false"></div>

    <!-- 侧边栏 -->
    <aside
      class="fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 md:translate-x-0 flex flex-col"
      :class="mobileOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="h-16 flex flex-col items-center justify-center px-4 border-b border-gray-800 relative">
        <div class="flex items-center">
          <h1 class="text-xl font-bold text-gray-100">继保计算器</h1>
        </div>
        <p class="text-xs text-gray-500 mt-1">编译时间: {{ buildTime }}</p>
        <button class="md:hidden absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white" @click="mobileOpen=false">✕</button>
      </div>

      <nav class="flex-1 overflow-y-auto py-4">
        <ul class="space-y-1 px-2">
          <li v-for="item in navItems" :key="item.name">
            <RouterLink
              :to="`/calculators/${item.name}`"
              class="block px-4 py-2 rounded-lg transition"
              :class="isActive(item) ? 'bg-blue-900/50 text-blue-300' : 'text-gray-300 hover:bg-gray-800 hover:text-white'"
              @click="mobileOpen=false"
            >
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="p-4 border-t border-gray-800 text-xs text-gray-500">
        © 2026 Relay Calculator
      </div>
    </aside>

    <!-- 主内容 -->
    <main class="flex-1 min-w-0 overflow-y-auto p-4 md:p-6">
      <div class="max-w-5xl mx-auto">
        <!-- 移动端顶部栏 -->
        <header class="md:hidden mb-6">
          <button
            class="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-lg text-gray-300 hover:text-white focus:outline-none"
            @click="mobileOpen=true"
          >
            ☰
          </button>
        </header>

        <RouterView />
      </div>
    </main>
  </div>
</template>