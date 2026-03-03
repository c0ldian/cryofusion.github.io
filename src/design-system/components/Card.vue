<template>
  <div class="bg-surface rounded-xl border border-border shadow-lg overflow-hidden transition-shadow duration-300"
       :class="hoverable ? 'hover:shadow-xl hover:shadow-blue-900/20 hover:border-primary-600/50' : ''">
    <div v-if="$slots.header || title" class="px-4 md:px-6 py-4 border-b border-border bg-surfaceHighlight/30">
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
