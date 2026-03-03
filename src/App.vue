<script setup>
import { computed, provide, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { theme } from './design-system'

const mobileOpen = ref(false)
const route = useRoute()

const buildTime = __BUILD_TIME__

const navTree = [
  {
    section: '总览',
    items: [{ name: 'home', label: '首页', path: '/' }]
  },
  {
    section: '故障与保护计算',
    items: [
      { name: 'short-circuit', label: '短路试验计算' },
      { name: 'short-circuit-current', label: '短路电流计算' },
      { name: 'over-current', label: '过流保护' },
      { name: 'distance', label: '距离保护' },
      { name: 'differential', label: '差动保护' },
      { name: 'sensitivity', label: '灵敏度校验' },
      { name: 'load-angle-verification', label: '带负荷相角校验' },
    ]
  },
  {
    section: '整定与比值',
    items: [
      { name: 'ct-ratio', label: 'CT 变比' },
      { name: 'pt-ratio', label: 'PT 变比' },
      { name: 'reclose-time', label: '重合闸时间' },
    ]
  },
]

const navSections = computed(() => navTree)

function getPath(item) {
  return item.path || `/calculators/${item.name}`
}

function isActive(item) {
  const path = getPath(item)
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(`${path}/`)
}

provide('theme', theme)
</script>

<template>
  <div class="flex min-h-screen" :style="{ backgroundColor: theme.colors.background, color: theme.colors.text.primary }">
    <div v-if="mobileOpen" class="fixed inset-0 bg-black/70 z-40 md:hidden" @click="mobileOpen=false"></div>

    <aside
      class="fixed md:static top-0 left-0 z-50 h-screen w-72 border-r flex flex-col transition-transform duration-300 -translate-x-full md:translate-x-0 shadow-2xl"
      :class="{ 'translate-x-0': mobileOpen }"
      :style="{
        background: 'var(--color-bg-sidebar)',
        borderColor: 'var(--color-border)'
      }"
    >
      <div class="h-16 flex items-center justify-between px-4 border-b shrink-0"
           :style="{ borderColor: 'var(--color-border)' }">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span class="text-white font-bold text-sm">继</span>
          </div>
          <div>
            <h1 class="text-base font-semibold tracking-wide" :style="{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }">RELAY CALC</h1>
            <p class="text-[11px]" :style="{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }">PROFESSIONAL</p>
          </div>
        </div>
        <button class="md:hidden hover:opacity-80" :style="{ color: 'var(--color-text-secondary)' }" @click="mobileOpen=false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div v-for="section in navSections" :key="section.section" class="space-y-2">
          <p class="px-2 text-[11px] uppercase tracking-[0.08em]" :style="{ color: 'var(--color-text-disabled)', fontFamily: 'var(--font-mono)' }">{{ section.section }}</p>
          <ul class="space-y-1">
            <li v-for="item in section.items" :key="item.name">
              <RouterLink
                :to="getPath(item)"
                class="block px-3 py-2.5 rounded-xl transition-all duration-200"
                :style="{
                  backgroundColor: isActive(item) ? 'var(--color-accent-dim)' : 'transparent',
                  color: isActive(item) ? 'var(--color-text-accent)' : 'var(--color-text-secondary)',
                  boxShadow: isActive(item) ? 'inset 0 0 0 1px var(--color-accent-glow)' : 'none', borderLeft: isActive(item) ? '2px solid var(--color-accent)' : '2px solid transparent'
                }"
                @click="mobileOpen=false"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">{{ item.label }}</span>
                  <span v-if="isActive(item)" class="w-1.5 h-1.5 rounded-full bg-sky-300"></span>
                </div>
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>

      <div class="p-4 border-t text-xs shrink-0" :style="{ borderColor: 'var(--color-border)', color: '#94a3b8' }">
        v{{ buildTime ? '2026.03' : 'dev' }} · Relay Calculator
      </div>
    </aside>

    <main class="flex-1 min-w-0 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(79,195,247,0.08),_transparent_45%)]">
      <div class="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <header class="md:hidden mb-6 flex items-center">
          <button
            class="flex items-center justify-center w-10 h-10 rounded-xl transition"
            :style="{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }"
            @click="mobileOpen=true"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <span class="ml-3 text-sm" :style="{ color: 'var(--color-text-secondary)' }">导航树</span>
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.9);
}

::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.7);
  border-radius: 999px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(129, 140, 248, 0.9);
}
</style>
