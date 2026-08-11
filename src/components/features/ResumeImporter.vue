<template>
  <div class="importer-container glass-panel">
    <div class="header-section">
      <div class="icon-glow">
        <Sparkles class="glow-icon" />
      </div>
      <h2>Tailor Your Resume</h2>
      <p class="subtitle">Upload your existing resume and paste the job description to align them instantly using AI.</p>
    </div>

    <!-- Step 1: Resume Intake -->
    <div class="intake-section">
      <div class="section-label">
        <span class="step-badge">1</span>
        <h3>Your Existing Resume</h3>
      </div>

      <!-- Drag & Drop Zone -->
      <div 
        v-if="!state.rawResumeText"
        class="drop-zone"
        :class="{ 'drop-zone-active': isDragging }"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
        @click="triggerFileInput"
      >
        <input 
          ref="fileInput" 
          type="file" 
          accept="application/pdf" 
          class="hidden" 
          @change="onFileSelected"
        />
        
        <div v-if="state.isParsing" class="parsing-state">
          <LoadingSpinner size="lg" />
          <p>Extracting text from PDF resume...</p>
        </div>
        
        <div v-else class="idle-state">
          <UploadCloud class="upload-icon" />
          <p class="upload-title">Drag & Drop your PDF resume here</p>
          <p class="upload-subtitle">or click to browse from your device</p>
          <span class="file-type-hint">Supports PDF up to 10MB</span>
        </div>
      </div>

      <!-- Parsed Text Preview / Manual Edit -->
      <div v-else class="text-preview-container">
        <div class="preview-header">
          <div class="file-info">
            <FileText class="file-icon" />
            <span>Resume Text Extracted Successfully</span>
          </div>
          <button class="clear-btn" @click="clearResumeText" title="Clear and upload new PDF">
            <X class="clear-icon" />
          </button>
        </div>
        <BaseTextarea
          v-model="resumeInputText"
          placeholder="Paste or edit your resume text here..."
          rows="6"
          class="preview-textarea"
        />
      </div>
      
      <!-- Parse Error Message -->
      <div v-if="state.parseError" class="error-banner">
        <AlertTriangle class="error-icon" />
        <span>{{ state.parseError }}</span>
      </div>
    </div>

    <!-- Step 2: Job Description & Tuning -->
    <div class="jd-section">
      <div class="section-label">
        <span class="step-badge">2</span>
        <h3>Job Details & Custom Instructions</h3>
      </div>

      <div class="form-grid">
        <BaseTextarea
          v-model="jdInputText"
          label="Target Job Description"
          placeholder="Paste the full job posting details here..."
          rows="6"
          required
        />
        
        <BaseTextarea
          v-model="customInputText"
          label="Custom Focus / Instructions (Optional)"
          placeholder="e.g., 'Focus more on backend architecture and AWS', 'Highlight leadership experience', 'Adopt a concise, impactful tone'."
          rows="3"
        />
      </div>
      
      <!-- Tailor Error Message -->
      <div v-if="state.tailorError" class="error-banner">
        <AlertTriangle class="error-icon" />
        <span>{{ state.tailorError }}</span>
      </div>
    </div>

    <!-- Action Section -->
    <div class="action-section">
      <BaseButton
        variant="primary"
        :loading="state.isTailoring"
        :disabled="!hasMinimumRequirements"
        :icon="Sparkles"
        class="tailor-btn"
        @click="tailorResume"
      >
        {{ state.isTailoring ? 'Analyzing & Tailoring...' : 'Generate Tailored Resume' }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useResumeStore } from '@/store/resumeStore'
import { UploadCloud, FileText, AlertTriangle, Sparkles, X } from '@lucide/vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const {
  state,
  setRawResumeText,
  setJobDescription,
  setCustomInstructions,
  setIsParsing,
  setIsTailoring,
  setParseError,
  setTailorError,
  setTailoredResume
} = useResumeStore()

const fileInput = ref(null)
const isDragging = ref(false)

// Initialize local refs with store state
const resumeInputText = ref(state.rawResumeText)
const jdInputText = ref(state.jobDescription)
const customInputText = ref(state.customInstructions)

// Sync local inputs to store on change
watch(resumeInputText, (newVal) => setRawResumeText(newVal))
watch(jdInputText, (newVal) => setJobDescription(newVal))
watch(customInputText, (newVal) => setCustomInstructions(newVal))

// Sync store updates (like loading from local storage) back to local refs
watch(() => state.rawResumeText, (newVal) => {
  resumeInputText.value = newVal
})
watch(() => state.jobDescription, (newVal) => {
  jdInputText.value = newVal
})
watch(() => state.customInstructions, (newVal) => {
  customInputText.value = newVal
})

const hasMinimumRequirements = computed(() => {
  return state.rawResumeText.trim().length > 10 && state.jobDescription.trim().length > 10
})

// File Drag & Drop Handlers
const onDragOver = () => {
  isDragging.value = true
}
const onDragLeave = () => {
  isDragging.value = false
}
const onDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type === 'application/pdf') {
    handlePdfUpload(file)
  } else {
    setParseError('Only PDF files are supported.')
  }
}

// File Dialog Selection
const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click()
}
const onFileSelected = (e) => {
  const file = e.target.files[0]
  if (file) handlePdfUpload(file)
}

// API Call: PDF Parsing
const handlePdfUpload = async (file) => {
  if (file.size > 10 * 1024 * 1024) {
    setParseError('File is too large. Max size is 10MB.')
    return
  }

  setIsParsing(true)
  setParseError(null)

  try {
    const response = await fetch('/api/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/pdf'
      },
      body: file // Send binary data directly
    })

    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData.error || 'Failed to parse PDF.')
    }

    const data = await response.json()
    if (data.text) {
      setRawResumeText(data.text)
    } else {
      throw new Error('No text content extracted from PDF.')
    }
  } catch (error) {
    console.error('PDF parsing fail:', error)
    setParseError(error.message || 'An error occurred while parsing your PDF.')
  } finally {
    setIsParsing(false)
  }
}

const clearResumeText = () => {
  setRawResumeText('')
  setParseError(null)
}

// API Call: Gemini Tailoring
const tailorResume = async () => {
  if (!hasMinimumRequirements.value) return

  setIsTailoring(true)
  setTailorError(null)

  try {
    const response = await fetch('/api/tailor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeText: state.rawResumeText,
        jobDescription: state.jobDescription,
        customInstructions: state.customInstructions
      })
    })

    if (!response.ok) {
      const errData = await response.json()
      throw new Error(errData.error || 'Failed to tailor resume.')
    }

    const data = await response.json()
    setTailoredResume(data)
  } catch (error) {
    console.error('Tailoring fail:', error)
    setTailorError(error.message || 'An error occurred while tailoring your resume.')
  } finally {
    setIsTailoring(false)
  }
}
</script>

<style scoped>
.importer-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.header-section {
  text-align: center;
  margin-bottom: 8px;
}

.icon-glow {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--accent-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 0 20px 0 var(--ring-color);
}

.glow-icon {
  width: 24px;
  height: 24px;
  color: var(--accent-color);
}

h2 {
  font-size: 28px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 15px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.step-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent-color);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 14px;
}

h3 {
  font-size: 18px;
  color: var(--text-primary);
}

.drop-zone {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 48px;
  text-align: center;
  cursor: pointer;
  background: rgba(15, 23, 42, 0.01);
  transition: all 0.25s ease;
  position: relative;
}
.dark .drop-zone {
  background: rgba(255, 255, 255, 0.01);
}

.drop-zone:hover, .drop-zone-active {
  border-color: var(--accent-color);
  background: var(--accent-light);
  box-shadow: 0 0 16px 0 var(--ring-color);
}

.hidden {
  display: none;
}

.idle-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: var(--text-muted);
  transition: transform 0.2s;
}

.drop-zone:hover .upload-icon {
  transform: translateY(-4px);
  color: var(--accent-color);
}

.upload-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.upload-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

.file-type-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.parsing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--text-secondary);
}

.text-preview-container {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-secondary);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(15, 23, 42, 0.02);
}
.dark .preview-header {
  background: rgba(255, 255, 255, 0.02);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--accent-color);
  font-weight: 500;
}

.file-icon {
  width: 16px;
  height: 16px;
}

.clear-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  color: var(--text-muted);
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.clear-icon {
  width: 16px;
  height: 16px;
}

.preview-textarea :deep(.textarea-element) {
  border: none;
  border-radius: 0;
  background: transparent;
  padding: 16px;
}
.preview-textarea :deep(.textarea-element:focus) {
  box-shadow: none;
}

.error-banner {
  margin-top: 12px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--danger-color);
  font-size: 13px;
  font-weight: 500;
}

.error-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-section {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.tailor-btn {
  width: 100%;
  max-width: 320px;
  font-size: 15px;
  padding: 12px 24px;
}
</style>
