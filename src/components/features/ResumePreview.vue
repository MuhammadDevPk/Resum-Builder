<template>
  <div class="preview-page-container">
    <div class="resume-paper" id="resume-print-target">
      <!-- HEADER -->
      <header class="resume-header">
        <h1 class="candidate-name">{{ personal.name || 'Your Name' }}</h1>
        <div class="contact-line">
          <span v-if="personal.location">{{ personal.location }}</span>
          <span v-if="personal.location && (personal.email || personal.phone)" class="separator">|</span>
          
          <a v-if="personal.email" :href="`mailto:${personal.email}`" class="contact-link">
            {{ personal.email }}
          </a>
          <span v-if="personal.email && (personal.phone || personal.website || personal.github || personal.linkedin)" class="separator">|</span>
          
          <span v-if="personal.phone">{{ personal.phone }}</span>
          <span v-if="personal.phone && (personal.website || personal.github || personal.linkedin)" class="separator">|</span>

          <a v-if="personal.website" :href="formatUrl(personal.website)" target="_blank" class="contact-link">
            {{ cleanUrl(personal.website) }}
          </a>
          <span v-if="personal.website && (personal.github || personal.linkedin)" class="separator">|</span>

          <a v-if="personal.github" :href="formatUrl(personal.github)" target="_blank" class="contact-link">
            {{ cleanUrl(personal.github) }}
          </a>
          <span v-if="personal.github && personal.linkedin" class="separator">|</span>

          <a v-if="personal.linkedin" :href="formatUrl(personal.linkedin)" target="_blank" class="contact-link">
            {{ cleanUrl(personal.linkedin) }}
          </a>
        </div>
      </header>

      <!-- SUMMARY -->
      <section v-if="resume.summary" class="resume-section">
        <h2 class="section-title">Summary</h2>
        <div class="section-divider"></div>
        <p class="summary-text">{{ resume.summary }}</p>
      </section>

      <!-- EXPERIENCE -->
      <section v-if="resume.experience && resume.experience.length > 0" class="resume-section">
        <h2 class="section-title">Work Experience</h2>
        <div class="section-divider"></div>
        <div 
          v-for="(exp, idx) in resume.experience" 
          :key="idx" 
          class="resume-section-item"
        >
          <div class="item-header-row">
            <span class="company-name">{{ exp.company || 'Company Name' }}</span>
            <span class="item-duration">{{ exp.duration || 'Dates' }}</span>
          </div>
          <div class="item-subheader-row">
            <span class="role-title">{{ exp.role || 'Role Title' }}</span>
          </div>
          <ul v-if="exp.bullets && exp.bullets.length > 0" class="bullets-list">
            <li v-for="(bullet, bIdx) in exp.bullets" :key="bIdx" class="bullet-item">
              {{ bullet }}
            </li>
          </ul>
        </div>
      </section>

      <!-- PROJECTS -->
      <section v-if="resume.projects && resume.projects.length > 0" class="resume-section">
        <h2 class="section-title">Projects</h2>
        <div class="section-divider"></div>
        <div 
          v-for="(proj, idx) in resume.projects" 
          :key="idx" 
          class="resume-section-item"
        >
          <div class="item-header-row">
            <span class="project-title">
              <span class="company-name">{{ proj.name || 'Project Name' }}</span>
              <span v-if="proj.technologies" class="project-tech">
                &nbsp;|&nbsp; <em>{{ proj.technologies }}</em>
              </span>
            </span>
            <span class="item-duration">{{ proj.duration || '' }}</span>
          </div>
          <div v-if="proj.description" class="item-subheader-row">
            <span class="project-desc">{{ proj.description }}</span>
          </div>
          <ul v-if="proj.bullets && proj.bullets.length > 0" class="bullets-list">
            <li v-for="(bullet, bIdx) in proj.bullets" :key="bIdx" class="bullet-item">
              {{ bullet }}
            </li>
          </ul>
        </div>
      </section>

      <!-- SKILLS -->
      <section v-if="resume.skills && resume.skills.length > 0" class="resume-section">
        <h2 class="section-title">Skills</h2>
        <div class="section-divider"></div>
        <div class="skills-container">
          <div 
            v-for="(skill, idx) in resume.skills" 
            :key="idx" 
            class="skills-row"
          >
            <span class="skills-category">{{ skill.category }}:</span>
            <span class="skills-values">{{ Array.isArray(skill.values) ? skill.values.join(', ') : '' }}</span>
          </div>
        </div>
      </section>

      <!-- EDUCATION -->
      <section v-if="resume.education && resume.education.length > 0" class="resume-section">
        <h2 class="section-title">Education</h2>
        <div class="section-divider"></div>
        <div 
          v-for="(edu, idx) in resume.education" 
          :key="idx" 
          class="resume-section-item"
        >
          <div class="item-header-row">
            <span class="company-name">{{ edu.school || 'University Name' }}</span>
            <span class="item-duration">{{ edu.duration || 'Graduation Date' }}</span>
          </div>
          <div class="item-subheader-row">
            <span class="role-title">{{ edu.degree || 'Degree Title' }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useResumeStore } from '@/store/resumeStore'

const { state } = useResumeStore()

const resume = computed(() => state.tailoredResume)
const personal = computed(() => state.tailoredResume.personal)

// Utility functions for links cleanup
const cleanUrl = (url) => {
  if (!url) return ''
  return url
    .replace(/https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/i, '') // strip trailing slashes
}

const formatUrl = (url) => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `https://${url}`
}
</script>

<style scoped>
.preview-page-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  overflow-y: auto;
  padding: 20px;
}

/* Paper Emulation Mode */
.resume-paper {
  background-color: #ffffff;
  color: #111827; /* Near black body */
  width: 8.5in;
  min-height: 11in;
  padding: 0.75in;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  box-sizing: border-box;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  text-align: left;
  line-height: 1.4;
}

/* Typography resets for high fidelity resume matching */
.resume-header {
  text-align: center;
  margin-bottom: 16px;
}

.candidate-name {
  font-family: 'Outfit', 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  color: #000000;
  margin-bottom: 6px;
}

.contact-line {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #374151; /* Dark Gray */
}

.separator {
  color: #9ca3af; /* Light Gray */
  font-weight: 300;
}

.contact-link {
  color: #000000;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.15s;
}

.contact-link:hover {
  border-color: #000000;
}

.resume-section {
  margin-bottom: 14px;
}

.section-title {
  font-family: 'Outfit', 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #000000;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
}

.section-divider {
  border-top: 1px solid #111827; /* Strong dividing line */
  margin-bottom: 8px;
}

.summary-text {
  font-size: 10px;
  color: #1f2937;
  text-align: justify;
}

.resume-section-item {
  margin-bottom: 10px;
}
.resume-section-item:last-child {
  margin-bottom: 0;
}

.item-header-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-weight: 700;
  font-size: 11px;
  color: #000000;
}

.company-name {
  font-weight: 700;
}

.project-tech {
  font-weight: 400;
  font-size: 10px;
  color: #374151;
}

.item-duration {
  font-weight: 500;
  font-size: 10px;
  color: #111827;
}

.item-subheader-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 10px;
  color: #1f2937;
  margin-top: 1px;
  margin-bottom: 4px;
}

.role-title {
  font-style: italic;
  font-weight: 500;
}

.project-desc {
  font-size: 10px;
  color: #374151;
}

.bullets-list {
  margin-left: 16px;
  padding-left: 0;
  list-style-type: disc;
}

.bullet-item {
  font-size: 9.5px;
  color: #1f2937;
  margin-bottom: 2px;
  line-height: 1.35;
  text-align: justify;
}
.bullet-item:last-child {
  margin-bottom: 0;
}

.skills-container {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.skills-row {
  font-size: 10px;
  line-height: 1.4;
}

.skills-category {
  font-weight: 700;
  color: #000000;
  margin-right: 6px;
}

.skills-values {
  color: #1f2937;
}

/* Print Override styling */
@media print {
  .preview-page-container {
    padding: 0 !important;
    background: transparent !important;
  }
  .resume-paper {
    width: 100% !important;
    min-height: 0 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    color: #000000 !important;
    background-color: #ffffff !important;
  }
}
</style>
