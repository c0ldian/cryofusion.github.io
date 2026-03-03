<template>
  <div class="space-y-1.5">
    <label v-if="label" class="block text-sm font-medium text-text-secondary">
      {{ label }}
      <span v-if="required" class="text-error-500 ml-0.5">*</span>
    </label>
    <div class="relative">
      <input
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'w-full bg-surface border rounded-lg px-4 py-3 text-text-primary transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-error-500 focus:ring-error-500/50 focus:border-error-500' : 'border-border hover:border-gray-600',
          success ? 'border-success-500 focus:ring-success-500/50' : '',
          size === 'sm' ? 'text-sm py-2 px-3' : '',
          className
        ]"
      />
      <div v-if="loading" class="absolute right-3 top-1/2 -translate-y-1/2">
        <svg class="animate-spin h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <div v-if="suffix" class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
        {{ suffix }}
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
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  error: String,
  success: Boolean,
  hint: String,
  disabled: Boolean,
  loading: Boolean,
  required: Boolean,
  suffix: String,
  size: {
    type: String,
    default: 'normal',
    validator: (v) => ['sm', 'normal'].includes(v)
  },
  className: String
})

defineEmits(['update:modelValue'])
</script>
