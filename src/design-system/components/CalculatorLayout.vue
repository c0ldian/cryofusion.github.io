<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <Badge v-if="badge" :variant="badge.variant">{{ badge.text }}</Badge>
          <span v-if="version" class="text-xs text-text-muted bg-surfaceHighlight px-2 py-1 rounded">v{{ version }}</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-bold text-text-primary">{{ title }}</h1>
        <p v-if="description" class="mt-2 text-text-secondary">{{ description }}</p>
      </div>
      <div class="flex gap-3">
        <Button v-if="showReset" variant="secondary" size="sm" @click="$emit('reset')">
          <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          重置
        </Button>
        <Button v-if="showBack" variant="ghost" size="sm" @click="$router.push('/')">
          返回主页
        </Button>
      </div>
    </div>

    <!-- Main content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Input section -->
      <div class="lg:col-span-2 space-y-6">
        <Card v-for="section in sections" :key="section.title" :title="section.title" :hoverable="section.hoverable">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              v-for="field in section.fields"
              :key="field.key"
              v-model="modelValue[field.key]"
              :label="field.label"
              :type="field.type || 'number'"
              :placeholder="field.placeholder"
              :hint="field.hint"
              :suffix="field.suffix"
              :required="field.required"
              :step="field.step"
              @update:modelValue="$emit('field-change', field.key, $event)"
            />
          </div>
        </Card>

        <!-- Actions -->
        <div class="flex gap-4">
          <Button
            variant="primary"
            size="lg"
            :loading="calculating"
            :disabled="!canCalculate"
            @click="$emit('calculate')"
            class="flex-1"
          >
            <svg v-if="!calculating" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {{ calculating ? '计算中...' : calculateLabel }}
          </Button>
          <Button v-if="showCopy" variant="secondary" size="lg" :disabled="!hasResults" @click="$emit('copy')">
            <svg class="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            复制结果
          </Button>
        </div>

        <!-- Errors -->
        <Alert v-if="errors.length" variant="error" :dismissible="true" @dismiss="errors = []">
          <p class="font-medium mb-1">请检查以下问题：</p>
          <ul class="list-disc pl-5 space-y-1">
            <li v-for="(err, idx) in errors" :key="idx">{{ err }}</li>
          </ul>
        </Alert>
      </div>

      <!-- Results section -->
      <div class="lg:col-span-1">
        <Card v-if="hasResults" title="计算结果" class="sticky top-6">
          <div class="space-y-4">
            <div v-for="result in resultItems" :key="result.key" class="p-3 bg-surfaceHighlight/50 rounded-lg">
              <p class="text-xs text-text-muted uppercase tracking-wider mb-1">{{ result.label }}</p>
              <p class="text-xl font-mono" :class="result.valueClass">
                {{ typeof result.value === 'number' ? result.value.toFixed(result.precision || 2) : result.value }}
                <span v-if="result.unit" class="text-sm text-text-muted ml-1">{{ result.unit }}</span>
              </p>
            </div>
          </div>

          <!-- Additional info -->
          <div v-if="additionalInfo" class="mt-4 pt-4 border-t border-border">
            <p class="text-sm text-text-secondary">{{ additionalInfo }}</p>
          </div>
        </Card>

        <!-- Empty state -->
        <Card v-else class="sticky top-6">
          <div class="text-center py-8">
            <svg class="w-16 h-16 mx-auto text-text-muted opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="mt-4 text-text-secondary">填写参数后点击计算</p>
          </div>
        </Card>
      </div>
    </div>

    <!-- Formulas section -->
    <Card v-if="formulas" title="计算公式">
      <div class="prose prose-invert max-w-none text-sm">
        <div v-for="(formula, idx) in formulas" :key="idx" class="mb-4 pb-4 border-b border-border last:border-0 last:pb-0 last:mb-0">
          <p class="text-text-secondary mb-2">{{ formula.description }}</p>
          <pre class="bg-surfaceHighlight p-3 rounded-lg overflow-x-auto text-text-primary font-mono text-sm"><code>{{ formula.equation }}</code></pre>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Card, Button, Input, Select, Badge, Alert } from '../index.js'

defineProps({
  title: { type: String, required: true },
  description: String,
  badge: { type: Object, default: null }, // { text, variant }
  version: String,
  modelValue: { type: Object, required: true },
  sections: { type: Array, required: true },
  calculating: Boolean,
  canCalculate: Boolean,
  calculateLabel: { type: String, default: '开始计算' },
  showReset: { type: Boolean, default: true },
  showBack: { type: Boolean, default: true },
  showCopy: { type: Boolean, default: true },
  hasResults: Boolean,
  resultItems: { type: Array, default: () => [] }, // { key, label, value, unit, precision, valueClass }
  additionalInfo: String,
  formulas: { type: Array, default: null }, // [{ description, equation }]
  errors: { type: Array, default: () => [] }
})

defineEmits(['reset', 'calculate', 'copy', 'field-change'])
</script>
