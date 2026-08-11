<template>
  <div class="textarea-wrapper">
    <label v-if="label" :for="uuid" class="textarea-label">
      {{ label }} <span v-if="required" class="required-asterisk">*</span>
    </label>
    <textarea
      :id="uuid"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :rows="rows"
      class="glass-input textarea-element"
      :class="{ 'textarea-error-border': error }"
      @input="$emit('update:modelValue', $event.target.value)"
      v-bind="$attrs"
    ></textarea>
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  rows: {
    type: [Number, String],
    default: 4
  },
  id: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])

const uuid = computed(() => {
  return props.id || `textarea-${Math.random().toString(36).substring(2, 11)}`
})
</script>

<style scoped>
.textarea-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.textarea-label {
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.required-asterisk {
  color: var(--danger-color);
  margin-left: 2px;
}

.textarea-element {
  padding: 10px 14px;
  font-size: 14px;
  width: 100%;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
  line-height: 1.5;
}

.textarea-error-border {
  border-color: var(--danger-color) !important;
}
.textarea-error-border:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important;
}

.error-message {
  font-size: 12px;
  color: var(--danger-color);
  font-weight: 500;
}
</style>
