<template>
  <div class="space-y-6">
    <nav class="flex items-center space-x-2 text-sm text-gray-400">
      <RouterLink to="/" class="hover:text-white">首页</RouterLink>
      <span>›</span>
      <span class="text-white">距离保护校验</span>
    </nav>

    <h1 class="text-2xl md:text-3xl font-bold text-gray-100">距离保护校验</h1>

    <div class="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-4">
      <p class="text-gray-300 text-sm">
        距离保护校验分为两个模块：<strong>相间距离</strong> 和 <strong>方向距离</strong>。
        请选择对应的计算器开始：
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RouterLink to="/calculators/distance/phase" class="block bg-gray-900 hover:bg-gray-800 rounded-xl p-6 border border-gray-800 transition">
        <h2 class="text-xl font-semibold text-gray-200 mb-2">相间距离校验</h2>
        <p class="text-gray-400 text-sm">AB/BC/CA 两相短路，测量阻抗计算与动作验证</p>
      </RouterLink>

      <RouterLink to="/calculators/distance/directional" class="block bg-gray-900 hover:bg-gray-800 rounded-xl p-6 border border-gray-800 transition">
        <h2 class="text-xl font-semibold text-gray-200 mb-2">方向距离校验</h2>
        <p class="text-gray-400 text-sm">方向阻抗圆特性，根据灵敏角确定正反向边界</p>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
</style>
