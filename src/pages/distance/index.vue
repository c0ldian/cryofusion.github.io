<template>
  <div class="space-y-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-100">距离保护校验</h1>

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
