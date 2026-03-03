<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface',
      variantStyles,
      sizeStyles,
      className
    ]"
    @click="$emit('click', $event)"
  >
    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'success', 'warning', 'danger', 'ghost'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: Boolean,
  loading: Boolean,
  block: Boolean,
  className: String
})

defineEmits(['click'])

const variantStyles = computed(() => {
  const base = 'focus:ring-primary-500'
  const styles = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white disabled:bg-primary-800',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-800',
    success: 'bg-success-500 hover:bg-success-600 text-white disabled:bg-success-700',
    warning: 'bg-warning-500 hover:bg-warning-600 text-white disabled:bg-warning-600',
    danger: 'bg-error-500 hover:bg-error-600 text-white disabled:bg-error-700',
    ghost: 'bg-transparent hover:bg-surfaceHighlight text-text-primary hover:text-white border border-border'
  }
  return `${base} ${styles[props.variant]}`
})

const sizeStyles = computed(() => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  const blockStyle = props.block ? 'w-full' : ''
  return `${sizes[props.size]} ${blockStyle}`
})
</script>
