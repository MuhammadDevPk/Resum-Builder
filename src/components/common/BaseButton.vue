<template>
  <button
    :class="[
      'btn',
      `btn-${variant}`,
      { 'btn-loading': loading },
      { 'btn-disabled': disabled || loading }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <LoadingSpinner v-if="loading" size="sm" class="btn-spinner" />
    <component :is="icon" v-else-if="icon" class="btn-icon" />
    <span class="btn-text">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
import LoadingSpinner from './LoadingSpinner.vue'

defineProps({
  variant: {
    type: String,
    default: 'primary' // primary, secondary, danger, ghost
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  icon: {
    type: [Object, Function, String],
    default: null
  }
})

defineEmits(['click'])
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  outline: none;
  user-select: none;
  white-space: nowrap;
}

.btn-primary {
  background-color: var(--accent-color);
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
}
.btn-primary:hover:not(:disabled) {
  background-color: var(--accent-hover);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.btn-secondary {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}
.btn-secondary:hover:not(:disabled) {
  background-color: var(--bg-primary);
  border-color: var(--border-hover);
}

.btn-danger {
  background-color: var(--danger-color);
  color: #ffffff;
}
.btn-danger:hover:not(:disabled) {
  background-color: var(--danger-hover);
}

.btn-ghost {
  background-color: transparent;
  color: var(--text-secondary);
}
.btn-ghost:hover:not(:disabled) {
  background-color: var(--accent-light);
  color: var(--accent-color);
}

.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none !important;
}

.btn-spinner {
  flex-shrink: 0;
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
</style>
