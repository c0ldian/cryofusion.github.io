<template>
  <div class="space-y-1.5">
    <label v-if="label" class="block text-sm font-medium text-text-secondary">
      {{ label }}
      <span v-if="required" class="text-error-500 ml-0.5">*</span>
    </label>
    <div class="relative">
      <select
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
        :disabled="disabled"
        :class="[
          'w-full bg-surface border rounded-lg px-4 py-3 text-text-primary transition-all duration-200 appearance-none cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-error-500 focus:ring-error-500/50 focus:border-error-500' : 'border-border hover:border-gray-600',
          className
        ]"
      >
        <option v-if="placeholder" value="" disabled class="bg-surface text-text-muted">
          {{ placeholder }}
        </option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value" class="bg-surface text-text-primary">
          {{ opt.label }}
        </option>
      </select>
      <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>
    <p v-if="error" class="text-sm text-error-500 mt-1">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-text-muted mt-1">{{ hint }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: [String, Number],
  label: String,
  options: {
    type: Array,
    required: true,
    // each item: { value, label }
  },
  placeholder: String,
  error: String,
  hint: String,
  disabled: Boolean,
  required: Boolean,
  className: String
})

defineEmits(['update:modelValue'])
</script>
