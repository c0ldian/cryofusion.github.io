<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { theme } from './design-system'

const mobileOpen = ref(false)
const route = useRoute()

const buildTime = __BUILD_TIME__

const navItems = [
  { name: 'home', label: '首页', path: '/' },
  { name: 'short-circuit', label: '短路试验计算' },
  { name: 'short-circuit-current', label: '短路电流计算' },
  { name: 'over-current', label: '过流保护' },
  { name: 'distance', label: '距离保护' },
  { name: 'differential', label: '差动保护' },
  { name: 'ct-ratio', label: 'CT 变比' },
  { name: 'pt-ratio', label: 'PT 变比' },
  { name: 'reclose-time', label: '重合闸时间' },
  { name: 'sensitivity', label: '灵敏度校验' },
  { name: 'load-angle-verification', label: '带负荷相角校验' },
]

function isActive(item) {
  if (item.path === '/') return route.path === '/'
  const basePath = item.path || `/calculators/${item.name}`
  return route.path === basePath || route.path.startsWith(`${basePath}/`)
}

// Inject theme for global CSS variables
import { provide } from 'vue'
provide('theme', theme)
</script>

<template>
  <div class="flex min-h-screen" :style="{ backgroundColor: theme.colors.background, color: theme.colors.text.primary }">
    <!-- 移动端遮罩 -->
    <div v-if="mobileOpen" class="fixed inset-0 bg-black/80 z-40 md:hidden" @click="mobileOpen=false"></div>

    <!-- 侧边栏 -->
    <aside
      class="fixed md:sticky top-0 left-0 z-50 h-screen w-64 border-r flex flex-col transition-transform duration-300 md:translate-x-0"
      :style="{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)'
      }"
    >
      <div class="h-16 flex flex-col items-center justify-center px-4 border-b relative shrink-0"
           :style="{ borderColor: theme.colors.border }">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span class="text-white font-bold text-sm">继</span>
          </div>
          <h1 class="text-lg font-bold" :style="{ color: theme.colors.text.primary }">继保计算器</h1>
        </div>
        <p class="text-xs mt-1" :style="{ color: theme.colors.text.muted }">v{{ buildTime ? '2026.02' : 'dev' }}</p>
        <button class="md:hidden absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-80"
               :style="{ color: theme.colors.text.muted }" @click="mobileOpen=false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto py-4 px-2">
        <ul class="space-y-1">
          <li v-for="item in navItems" :key="item.name">
            <RouterLink
              :to="item.path || `/calculators/${item.name}`"
              class="block px-3 py-2 rounded-lg transition-all duration-200"
              :class="isActive(item) ? '' : 'opacity-70 hover:opacity-100'"
              :style="{
                backgroundColor: isActive(item) ? theme.colors.primary['600'] + '20' : 'transparent',
                color: isActive(item) ? theme.colors.primary['300'] : theme.colors.text.secondary,
                borderLeft: isActive(item) ? `3px solid ${theme.colors.primary['500']}` : '3px solid transparent'
              }"
              @click="mobileOpen=false"
            >
              <div class="flex items-center">
                <span class="text-sm">{{ item.label }}</span>
              </div>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="p-4 border-t text-xs shrink-0" :style="{ borderColor: theme.colors.border, color: theme.colors.text.muted }">
        © 2026 Relay Calculator
      </div>
    </aside>

    <!-- 主内容 -->
    <main class="flex-1 min-w-0 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_45%),radial-gradient(circle_at_80%_20%,_rgba(168,85,247,0.10),_transparent_45%)]">
      <div class="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <!-- 移动端顶部栏 -->
        <header class="md:hidden mb-6 flex items-center">
          <button
            class="flex items-center justify-center w-10 h-10 rounded-lg transition"
            :style="{ backgroundColor: theme.colors.surfaceHighlight, color: theme.colors.text.secondary }"
            @click="mobileOpen=true"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <span class="ml-3 text-sm" :style="{ color: theme.colors.text.muted }">菜单</span>
        </header>

        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<style>
/* Global theme styles */
:root {
  --color-bg: rgb(3, 7, 18);
  --color-surface: rgb(17, 24, 39);
  --color-surface-highlight: rgb(31, 41, 55);
  --color-border: rgb(55, 65, 81);
  --color-primary: rgb(59, 130, 246);
  --color-primary-dark: rgb(37, 99, 235);
  --color-text-primary: rgb(243, 244, 246);
  --color-text-secondary: rgb(156, 163, 175);
}

/* Smooth page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-surface);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}
</style>
