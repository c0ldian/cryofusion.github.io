<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
      variantStyles
    ]"
  >
    <span v-if="dot" class="w-1.5 h-1.5 rounded-full mr-1.5" :class="dotColor"></span>
    <slot></slot>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'primary', 'success', 'warning', 'error'].includes(v)
  },
  dot: {
    type: Boolean,
    default: false
  }
})

const variantStyles = computed(() => {
  const styles = {
    default: 'bg-gray-800 text-gray-300 border border-gray-700',
    primary: 'bg-primary-900/50 text-primary-300 border border-primary-700/50',
    success: 'bg-success-900/30 text-success-400 border border-success-700/30',
    warning: 'bg-warning-900/30 text-warning-400 border border-warning-600/30',
    error: 'bg-error-900/30 text-error-400 border border-error-700/30'
  }
  return styles[props.variant]
})

const dotColor = computed(() => {
  const colors = {
    default: 'bg-gray-500',
    primary: 'bg-primary-400',
    success: 'bg-success-400',
    warning: 'bg-warning-400',
    error: 'bg-error-400'
  }
  return colors[props.variant]
})
</script>
