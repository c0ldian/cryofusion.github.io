<template>
  <div class="bg-gray-900 rounded-xl shadow-lg p-6">
    <h2 class="text-xl font-semibold mb-6 text-gray-200">特性曲线与测试点</h2>

    <div v-if="!calcStore.results" class="text-gray-500 text-center py-12">
      参数不足，无法生成曲线
    </div>

    <div v-else ref="chartRef" class="w-full h-80"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { useCalculationStore } from '../store/calculationStore'
import { generateCharacteristicCurve } from '../calc/characteristicEngine'

const calcStore = useCalculationStore()
const chartRef = ref(null)
let chart = null

const chartData = computed(() => {
  if (!calcStore.results) return { curve: [], points: [] }
  const { Id_min, I_break, k1, k2 } = calcStore.settings
  const Id_min_val = Number(Id_min)
  const I_break_val = Number(I_break)
  const k1_val = Number(k1)
  const k2_val = Number(k2)
  const curve = generateCharacteristicCurve(Id_min_val, I_break_val, k1_val, k2_val)
  const points = calcStore.results.table.map(row => [row.I_res, row.I_diff])
  return { curve, points }
})

function renderChart() {
  if (!chartRef.value) return
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
  const { curve, points } = chartData.value
  const seriesList = [
    {
      name: '制动特性',
      type: 'line',
      data: curve.map(p => [p.I_res, p.Id_set]),
      smooth: false,
      lineStyle: { color: '#60a5fa', width: 2 },
      symbol: 'none',
    },
    {
      name: '测试点',
      type: 'scatter',
      data: points,
      itemStyle: { color: '#10b981' },
      symbolSize: 8,
    },
  ]
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = params[0]
        return `I_res: ${p.value[0].toFixed(2)} A<br/>I_diff: ${p.value[1].toFixed(2)} A`
      },
    },
    grid: { left: '10%', right: '5%', top: '10%', bottom: '15%' },
    xAxis: {
      type: 'value',
      name: 'I_res (A)',
      nameLocation: 'middle',
      nameGap: 30,
      splitLine: { lineStyle: { color: '#374151' } },
      axisLine: { lineStyle: { color: '#9ca3af' } },
      axisLabel: { color: '#d1d5db' },
    },
    yAxis: {
      type: 'value',
      name: 'I_diff (A)',
      splitLine: { lineStyle: { color: '#374151' } },
      axisLine: { lineStyle: { color: '#9ca3af' } },
      axisLabel: { color: '#d1d5db' },
    },
    series: seriesList,
  }
  chart.setOption(option)
}

onMounted(() => {
  renderChart()
})

watch(chartData, () => {
  renderChart()
}, { deep: true })

onUnmounted(() => chart?.dispose())
window.addEventListener('resize', () => chart?.resize())
</script>

<style scoped>
</style>