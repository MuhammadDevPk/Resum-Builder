<template>
  <!-- Main app wrapper, hidden during print -->
  <div class="app-wrapper no-print">
    <!-- Main App Header -->
    <header class="app-header glass-panel">
      <div class="header-logo">
        <Sparkles class="logo-icon" />
        <span class="logo-title">AI Resume Tailor</span>
      </div>
      <div class="header-actions">
        <BaseButton
          v-if="hasTailoredData"
          variant="ghost"
          :icon="ArrowLeft"
          @click="confirmReset"
        >
          Start Over
        </BaseButton>
        <BaseButton
          v-if="hasTailoredData"
          variant="primary"
          :icon="Printer"
          @click="triggerPrint"
        >
          Download PDF
        </BaseButton>
        <button
          class="theme-toggle-btn"
          :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          @click="toggleDarkMode"
        >
          <Sun v-if="isDarkMode" class="theme-icon" />
          <Moon v-else class="theme-icon" />
        </button>
      </div>
    </header>

    <!-- App Views -->
    <main class="app-main">
      <div v-if="!hasTailoredData" class="view-importer">
        <ResumeImporter />
      </div>
      <div v-else class="view-workspace">
        <div class="pane pane-editor">
          <ResumeEditor />
        </div>
        <div class="pane pane-preview">
          <ResumePreview />
        </div>
      </div>
    </main>
  </div>

  <!-- Print isolated element (Only visible when browser print layout triggers) -->
  <div class="print-preview-root">
    <ResumePreview v-if="hasTailoredData" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useResumeStore } from '@/store/resumeStore'
import { Sparkles, ArrowLeft, Printer, Sun, Moon } from '@lucide/vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ResumeImporter from '@/components/features/ResumeImporter.vue'
import ResumeEditor from '@/components/features/ResumeEditor.vue'
import ResumePreview from '@/components/features/ResumePreview.vue'

const { state, loadFromLocalStorage, resetStore } = useResumeStore()

const isDarkMode = ref(false)

const hasTailoredData = computed(() => {
  return !!state.tailoredResume.summary
})

onMounted(() => {
  // Load cached resume data if exists
  loadFromLocalStorage()

  // Initialize theme matching preferences
  let cachedTheme = null
  try {
    cachedTheme = localStorage.getItem('theme_preference')
  } catch (e) {
    console.error('Failed to read theme preference from localStorage:', e)
  }
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  if (cachedTheme === 'dark' || (!cachedTheme && systemPrefersDark)) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDarkMode.value = false
    document.documentElement.classList.remove('dark')
  }
})

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  try {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme_preference', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme_preference', 'light')
    }
  } catch (e) {
    console.error('Failed to write theme preference to localStorage:', e)
  }
}

const confirmReset = () => {
  if (confirm('Are you sure you want to start over? This will reset all current edits.')) {
    resetStore()
  }
}

const triggerPrint = () => {
  window.print()
}
</script>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
  z-index: 10;
  flex-shrink: 0;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 22px;
  height: 22px;
  color: var(--accent-color);
  animation: float 3s ease-in-out infinite;
}

.logo-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--text-primary), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.theme-toggle-btn:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
  box-shadow: 0 0 8px var(--ring-color);
}

.theme-icon {
  width: 18px;
  height: 18px;
}

.app-main {
  flex-grow: 1;
  overflow: hidden;
  position: relative;
}

.view-importer {
  height: 100%;
  overflow-y: auto;
  padding: 40px 20px;
}

.view-workspace {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.pane {
  height: 100%;
  overflow-y: auto;
}

.pane-editor {
  width: 45%;
  border-right: 1px solid var(--border-color);
  background: var(--bg-primary);
  padding: 24px;
}

.pane-preview {
  width: 55%;
  background: var(--border-color);
  display: flex;
  justify-content: center;
}

/* Hidden elements in screen mode */
.print-preview-root {
  display: none;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(0px); }
}

@media (max-width: 1024px) {
  .view-workspace {
    flex-direction: column;
    overflow-y: auto;
  }
  .pane {
    height: auto;
    width: 100% !important;
  }
  .pane-editor {
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
}

/* Print Override styling */
@media print {
  .app-wrapper {
    display: none !important;
  }
  .print-preview-root {
    display: block !important;
    width: 100% !important;
    background: white !important;
  }
}
</style>
