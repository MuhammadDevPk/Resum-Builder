<template>
  <div class="input-wrapper">
    <label v-if="label" :for="uuid" class="input-label">
      {{ label }} <span v-if="required" class="required-asterisk">*</span>
    </label>
    <input
      :id="uuid"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      class="glass-input input-element"
      :class="{ 'input-error-border': error }"
      @input="$emit('update:modelValue', $event.target.value)"
      v-bind="$attrs"
    />
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
    type: [String, Number],
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  error: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])

const uuid = computed(() => {
  return props.id || `input-${Math.random().toString(36).substring(2, 11)}`
})
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.input-label {
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.required-asterisk {
  color: var(--danger-color);
  margin-left: 2px;
}

.input-element {
  padding: 10px 14px;
  font-size: 14px;
  width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-error-border {
  border-color: var(--danger-color) !important;
}
.input-error-border:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important;
}

.error-message {
  font-size: 12px;
  color: var(--danger-color);
  font-weight: 500;
}
</style>
