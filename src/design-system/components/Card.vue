<template>
  <div class="bg-surface rounded-lg border border-border overflow-hidden transition-all duration-150"
       :class="hoverable ? 'hover:border-[var(--color-border-active)]' : ''">
    <div v-if="$slots.header || title" class="px-4 md:px-6 py-4 border-b border-border bg-surfaceHighlight/20">
      <slot name="header">
        <h3 class="text-lg font-semibold text-text-primary">{{ title }}</h3>
      </slot>
    </div>
    <div class="p-4 md:p-6" :class="padding === 'none' ? 'p-0' : ''">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  hoverable: {
    type: Boolean,
    default: false
  },
  padding: {
    type: String,
    default: 'normal', // none, normal
    validator: (v) => ['none', 'normal'].includes(v)
  }
})
</script>
