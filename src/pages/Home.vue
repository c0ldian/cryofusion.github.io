<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl md:text-4xl font-bold text-gray-100">继电保护计算器</h1>
      <p class="text-gray-400 mt-2">选择计算模块开始使用</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <router-link
        v-for="calc in calculators"
        :key="calc.name"
        :to="`/calculators/${calc.name}`"
        class="group p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-500 transition-all duration-200 hover:shadow-lg"
      >
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-lg">
            •
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-100 group-hover:text-blue-400 transition">
              {{ calc.label }}
            </h2>
            <p class="text-sm text-gray-400 mt-1">{{ calc.desc }}</p>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
const calculators = [
  { name: 'short-circuit', label: '短路电流', desc: '三相/两相短路电流、标幺值' },
  { name: 'over-current', label: '过流保护', desc: '启动值、时间级差、灵敏度' },
  { name: 'distance', label: '距离保护', desc: '阻抗圆、动作阻抗计算' },
  { name: 'differential', label: '差动保护', desc: '不平衡电流计算' },
  { name: 'ct-ratio', label: 'CT 变比', desc: '变比与准确级校验' },
  { name: 'pt-ratio', label: 'PT 变比', desc: '电压互感器变比' },
  { name: 'reclose-time', label: '重合闸时间', desc: '时间整定与配合' },
  { name: 'sensitivity', label: '灵敏度校验', desc: '灵敏系数计算' },
]
</script>