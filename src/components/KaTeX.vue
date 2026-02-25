<template>
  <span v-html="rendered"></span>
</template>

<script setup>
import { computed } from 'vue'
import katex from 'katex'

const props = defineProps({
  formula: { type: String, required: true },
  displayMode: { type: Boolean, default: false }
})

const rendered = computed(() => {
  try {
    return katex.renderToString(props.formula, {
      displayMode: props.displayMode,
      throwOnError: false,
      output: 'html'
    })
  } catch (e) {
    console.warn('KaTeX render error:', e)
    return props.formula
  }
})
</script>