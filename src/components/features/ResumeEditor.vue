<template>
  <div class="editor-container glass-panel">
    <!-- Tabs Navigation -->
    <div class="tabs-nav no-print">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ 'tab-btn-active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" class="tab-icon" />
        <span class="tab-label">{{ tab.name }}</span>
      </button>
    </div>

    <!-- Tab Panels -->
    <div class="tab-panel">
      <!-- 1. PERSONAL INFORMATION -->
      <div v-if="activeTab === 'personal'" class="panel-content">
        <h3>Contact & Profile Information</h3>
        <p class="panel-subtitle">These details populate the header of your tailored resume.</p>
        <div class="form-grid-2">
          <BaseInput
            label="Full Name"
            placeholder="John Doe"
            :modelValue="state.tailoredResume.personal.name"
            @update:modelValue="updatePersonal('name', $event)"
          />
          <BaseInput
            label="Target Location"
            placeholder="Sargodha, PK"
            :modelValue="state.tailoredResume.personal.location"
            @update:modelValue="updatePersonal('location', $event)"
          />
          <BaseInput
            label="Email Address"
            placeholder="john.doe@example.com"
            type="email"
            :modelValue="state.tailoredResume.personal.email"
            @update:modelValue="updatePersonal('email', $event)"
          />
          <BaseInput
            label="Phone Number"
            placeholder="+92 3456047058"
            type="tel"
            :modelValue="state.tailoredResume.personal.phone"
            @update:modelValue="updatePersonal('phone', $event)"
          />
          <BaseInput
            label="Personal Portfolio Website"
            placeholder="johndoe.dev"
            :modelValue="state.tailoredResume.personal.website"
            @update:modelValue="updatePersonal('website', $event)"
          />
          <BaseInput
            label="GitHub Profile URL"
            placeholder="github.com/johndoe"
            :modelValue="state.tailoredResume.personal.github"
            @update:modelValue="updatePersonal('github', $event)"
          />
          <BaseInput
            label="LinkedIn Profile URL"
            placeholder="linkedin.com/in/johndoe"
            :modelValue="state.tailoredResume.personal.linkedin"
            @update:modelValue="updatePersonal('linkedin', $event)"
          />
        </div>
      </div>

      <!-- 2. PROFESSIONAL SUMMARY -->
      <div v-else-if="activeTab === 'summary'" class="panel-content">
        <h3>Professional Summary</h3>
        <p class="panel-subtitle">Write a brief statement emphasizing your value proposition tailored to the role.</p>
        <BaseTextarea
          placeholder="Highly experienced developer specializing in..."
          rows="8"
          :modelValue="state.tailoredResume.summary"
          @update:modelValue="updateSummary($event)"
        />
      </div>

      <!-- 3. WORK EXPERIENCE -->
      <div v-else-if="activeTab === 'experience'" class="panel-content">
        <div class="panel-header">
          <div>
            <h3>Work Experience</h3>
            <p class="panel-subtitle">Chronological record of roles, companies, and tailored achievements.</p>
          </div>
          <BaseButton :icon="Plus" variant="ghost" size="sm" @click="addExperienceItem">
            Add Role
          </BaseButton>
        </div>

        <div v-if="state.tailoredResume.experience.length === 0" class="empty-state">
          <Briefcase class="empty-icon" />
          <p>No experience entries. Click "Add Role" to build your history.</p>
        </div>

        <div v-else class="list-container">
          <div
            v-for="(exp, expIdx) in state.tailoredResume.experience"
            :key="expIdx"
            class="list-item-card glass-panel"
          >
            <div class="card-header">
              <h4>Role #{{ expIdx + 1 }}: {{ exp.role || 'New Role' }}</h4>
              <div class="card-actions">
                <button
                  class="action-btn"
                  title="Move Up"
                  :disabled="expIdx === 0"
                  @click="moveItem('experience', expIdx, -1)"
                >
                  <ChevronUp class="mini-icon" />
                </button>
                <button
                  class="action-btn"
                  title="Move Down"
                  :disabled="expIdx === state.tailoredResume.experience.length - 1"
                  @click="moveItem('experience', expIdx, 1)"
                >
                  <ChevronDown class="mini-icon" />
                </button>
                <button
                  class="action-btn danger-btn"
                  title="Delete Entry"
                  @click="removeExperienceItem(expIdx)"
                >
                  <Trash2 class="mini-icon" />
                </button>
              </div>
            </div>

            <div class="form-grid-3">
              <BaseInput
                label="Role Title"
                placeholder="Senior Agentic AI Engineer"
                :modelValue="exp.role"
                @update:modelValue="updateExperience(expIdx, { role: $event })"
              />
              <BaseInput
                label="Company Name"
                placeholder="Orochilab"
                :modelValue="exp.company"
                @update:modelValue="updateExperience(expIdx, { company: $event })"
              />
              <BaseInput
                label="Duration/Dates"
                placeholder="10/2025 - 12/2025"
                :modelValue="exp.duration"
                @update:modelValue="updateExperience(expIdx, { duration: $event })"
              />
            </div>

            <!-- Experience Bullets -->
            <div class="bullets-section">
              <div class="bullets-header">
                <h5>Achievements / Bullet Points</h5>
                <button class="add-bullet-btn" @click="addBullet(expIdx)">
                  <Plus class="micro-icon" /> Add Bullet
                </button>
              </div>
              <div class="bullets-list">
                <div
                  v-for="(bullet, bIdx) in exp.bullets"
                  :key="bIdx"
                  class="bullet-row"
                >
                  <span class="bullet-number">{{ bIdx + 1 }}</span>
                  <BaseInput
                    :modelValue="bullet"
                    placeholder="e.g. Engineered a secure secondary market ticketing platform using HMAC-signed QR codes."
                    class="bullet-input"
                    @update:modelValue="updateBullet(expIdx, bIdx, $event)"
                  />
                  <button
                    class="delete-bullet-btn"
                    title="Remove Bullet"
                    :disabled="exp.bullets.length <= 1"
                    @click="removeBullet(expIdx, bIdx)"
                  >
                    <Trash2 class="micro-icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. PROJECTS -->
      <div v-else-if="activeTab === 'projects'" class="panel-content">
        <div class="panel-header">
          <div>
            <h3>Featured Projects</h3>
            <p class="panel-subtitle">Tailored technical projects showing off your target competencies.</p>
          </div>
          <BaseButton :icon="Plus" variant="ghost" size="sm" @click="addProjectItem">
            Add Project
          </BaseButton>
        </div>

        <div v-if="state.tailoredResume.projects.length === 0" class="empty-state">
          <FolderGit class="empty-icon" />
          <p>No projects. Click "Add Project" to showcase your builds.</p>
        </div>

        <div v-else class="list-container">
          <div
            v-for="(proj, projIdx) in state.tailoredResume.projects"
            :key="projIdx"
            class="list-item-card glass-panel"
          >
            <div class="card-header">
              <h4>Project #{{ projIdx + 1 }}: {{ proj.name || 'New Project' }}</h4>
              <div class="card-actions">
                <button
                  class="action-btn"
                  title="Move Up"
                  :disabled="projIdx === 0"
                  @click="moveItem('projects', projIdx, -1)"
                >
                  <ChevronUp class="mini-icon" />
                </button>
                <button
                  class="action-btn"
                  title="Move Down"
                  :disabled="projIdx === state.tailoredResume.projects.length - 1"
                  @click="moveItem('projects', projIdx, 1)"
                >
                  <ChevronDown class="mini-icon" />
                </button>
                <button
                  class="action-btn danger-btn"
                  title="Delete Entry"
                  @click="removeProjectItem(projIdx)"
                >
                  <Trash2 class="mini-icon" />
                </button>
              </div>
            </div>

            <div class="form-grid-3">
              <BaseInput
                label="Project Name"
                placeholder="Voxle Voice Agent Builder"
                :modelValue="proj.name"
                @update:modelValue="updateProject(projIdx, { name: $event })"
              />
              <BaseInput
                label="Technologies Used"
                placeholder="Vue.js 3, FastAPI, WebRTC, OpenAI API"
                :modelValue="proj.technologies"
                @update:modelValue="updateProject(projIdx, { technologies: $event })"
              />
              <BaseInput
                label="Duration / Dates"
                placeholder="e.g. 11/2025 - Present"
                :modelValue="proj.duration"
                @update:modelValue="updateProject(projIdx, { duration: $event })"
              />
            </div>
            <div class="mt-4">
              <BaseInput
                label="Short Description / Subtitle"
                placeholder="e.g. Voice AI Agents builder platform"
                :modelValue="proj.description"
                @update:modelValue="updateProject(projIdx, { description: $event })"
              />
            </div>

            <!-- Project Bullets -->
            <div class="bullets-section">
              <div class="bullets-header">
                <h5>Key Contributions</h5>
                <button class="add-bullet-btn" @click="addProjectBullet(projIdx)">
                  <Plus class="micro-icon" /> Add Bullet
                </button>
              </div>
              <div class="bullets-list">
                <div
                  v-for="(bullet, bIdx) in proj.bullets"
                  :key="bIdx"
                  class="bullet-row"
                >
                  <span class="bullet-number">{{ bIdx + 1 }}</span>
                  <BaseInput
                    :modelValue="bullet"
                    placeholder="e.g. Built meta-agent features orchestrating multi-agent loops to support real-time audio streams."
                    class="bullet-input"
                    @update:modelValue="updateProjectBullet(projIdx, bIdx, $event)"
                  />
                  <button
                    class="delete-bullet-btn"
                    title="Remove Bullet"
                    :disabled="proj.bullets.length <= 1"
                    @click="removeProjectBullet(projIdx, bIdx)"
                  >
                    <Trash2 class="micro-icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. TECHNICAL SKILLS -->
      <div v-else-if="activeTab === 'skills'" class="panel-content">
        <div class="panel-header">
          <div>
            <h3>Technical Skills</h3>
            <p class="panel-subtitle">Group your engineering proficiencies to match search keywords.</p>
          </div>
          <BaseButton :icon="Plus" variant="ghost" size="sm" @click="addSkillCategory">
            Add Group
          </BaseButton>
        </div>

        <div v-if="state.tailoredResume.skills.length === 0" class="empty-state">
          <Award class="empty-icon" />
          <p>No skill classifications. Click "Add Group" to organize your stack.</p>
        </div>

        <div v-else class="list-container">
          <div
            v-for="(skill, skillIdx) in state.tailoredResume.skills"
            :key="skillIdx"
            class="list-item-card glass-panel"
          >
            <div class="card-header">
              <h4>Skill Group #{{ skillIdx + 1 }}: {{ skill.category || 'New Group' }}</h4>
              <div class="card-actions">
                <button
                  class="action-btn"
                  title="Move Up"
                  :disabled="skillIdx === 0"
                  @click="moveItem('skills', skillIdx, -1)"
                >
                  <ChevronUp class="mini-icon" />
                </button>
                <button
                  class="action-btn"
                  title="Move Down"
                  :disabled="skillIdx === state.tailoredResume.skills.length - 1"
                  @click="moveItem('skills', skillIdx, 1)"
                >
                  <ChevronDown class="mini-icon" />
                </button>
                <button
                  class="action-btn danger-btn"
                  title="Delete Group"
                  @click="removeSkillCategory(skillIdx)"
                >
                  <Trash2 class="mini-icon" />
                </button>
              </div>
            </div>

            <div class="form-grid-2">
              <BaseInput
                label="Category Title"
                placeholder="e.g. Programming Languages"
                :modelValue="skill.category"
                @update:modelValue="updateSkillCategory(skillIdx, $event)"
              />
              <BaseInput
                label="Skills (Comma-separated)"
                placeholder="e.g. PHP, Python, JavaScript, Node.js"
                :modelValue="Array.isArray(skill.values) ? skill.values.join(', ') : ''"
                @update:modelValue="updateSkillValues(skillIdx, $event)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 6. EDUCATION -->
      <div v-else-if="activeTab === 'education'" class="panel-content">
        <div class="panel-header">
          <div>
            <h3>Education History</h3>
            <p class="panel-subtitle">Formal degrees, diplomas, or institutional accomplishments.</p>
          </div>
          <BaseButton :icon="Plus" variant="ghost" size="sm" @click="addEducationItem">
            Add Degree
          </BaseButton>
        </div>

        <div v-if="state.tailoredResume.education.length === 0" class="empty-state">
          <GraduationCap class="empty-icon" />
          <p>No educational credentials. Click "Add Degree" to add academic history.</p>
        </div>

        <div v-else class="list-container">
          <div
            v-for="(edu, eduIdx) in state.tailoredResume.education"
            :key="eduIdx"
            class="list-item-card glass-panel"
          >
            <div class="card-header">
              <h4>Academic Record #{{ eduIdx + 1 }}: {{ edu.degree || 'New Degree' }}</h4>
              <div class="card-actions">
                <button
                  class="action-btn"
                  title="Move Up"
                  :disabled="eduIdx === 0"
                  @click="moveItem('education', eduIdx, -1)"
                >
                  <ChevronUp class="mini-icon" />
                </button>
                <button
                  class="action-btn"
                  title="Move Down"
                  :disabled="eduIdx === state.tailoredResume.education.length - 1"
                  @click="moveItem('education', eduIdx, 1)"
                >
                  <ChevronDown class="mini-icon" />
                </button>
                <button
                  class="action-btn danger-btn"
                  title="Delete Entry"
                  @click="removeEducationItem(eduIdx)"
                >
                  <Trash2 class="mini-icon" />
                </button>
              </div>
            </div>

            <div class="form-grid-3">
              <BaseInput
                label="Degree / Certificate"
                placeholder="Bachelor of Science in Computer Science"
                :modelValue="edu.degree"
                @update:modelValue="updateEducation(eduIdx, { degree: $event })"
              />
              <BaseInput
                label="Institution / University"
                placeholder="Sargodha University"
                :modelValue="edu.school"
                @update:modelValue="updateEducation(eduIdx, { school: $event })"
              />
              <BaseInput
                label="Graduation Date / Duration"
                placeholder="2019 - 2023"
                :modelValue="edu.duration"
                @update:modelValue="updateEducation(eduIdx, { duration: $event })"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useResumeStore } from '@/store/resumeStore'
import {
  User,
  FileText,
  Briefcase,
  FolderGit,
  Award,
  GraduationCap,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown
} from '@lucide/vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const {
  state,
  updatePersonal,
  updateSummary,
  updateExperience,
  addExperienceItem,
  removeExperienceItem,
  setExperienceList,
  updateProject,
  addProjectItem,
  removeProjectItem,
  setProjectsList,
  updateSkillCategory,
  updateSkillValues,
  addSkillCategory,
  removeSkillCategory,
  setSkillsList,
  updateEducation,
  addEducationItem,
  removeEducationItem,
  setEducationList
} = useResumeStore()

const activeTab = ref('personal')

const tabs = [
  { id: 'personal', name: 'Profile info', icon: User },
  { id: 'summary', name: 'Summary', icon: FileText },
  { id: 'experience', name: 'Experience', icon: Briefcase },
  { id: 'projects', name: 'Projects', icon: FolderGit },
  { id: 'skills', name: 'Skills', icon: Award },
  { id: 'education', name: 'Education', icon: GraduationCap }
]

// Array Re-ordering Swapper Action
const moveItem = (listName, index, direction) => {
  let list
  let setter

  if (listName === 'experience') {
    list = [...state.tailoredResume.experience]
    setter = setExperienceList
  } else if (listName === 'projects') {
    list = [...state.tailoredResume.projects]
    setter = setProjectsList
  } else if (listName === 'skills') {
    list = [...state.tailoredResume.skills]
    setter = setSkillsList
  } else if (listName === 'education') {
    list = [...state.tailoredResume.education]
    setter = setEducationList
  }

  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= list.length) return

  // Swap indices
  const temp = list[index]
  list[index] = list[targetIndex]
  list[targetIndex] = temp

  setter(list)
}

// Experience Bullet Mutation Handlers
const updateBullet = (expIndex, bulletIndex, value) => {
  const exp = state.tailoredResume.experience[expIndex]
  const newBullets = [...exp.bullets]
  newBullets[bulletIndex] = value
  updateExperience(expIndex, { bullets: newBullets })
}

const addBullet = (expIndex) => {
  const exp = state.tailoredResume.experience[expIndex]
  updateExperience(expIndex, { bullets: [...exp.bullets, ''] })
}

const removeBullet = (expIndex, bulletIndex) => {
  const exp = state.tailoredResume.experience[expIndex]
  const newBullets = exp.bullets.filter((_, idx) => idx !== bulletIndex)
  updateExperience(expIndex, { bullets: newBullets })
}

// Project Bullet Mutation Handlers
const updateProjectBullet = (projIndex, bulletIndex, value) => {
  const proj = state.tailoredResume.projects[projIndex]
  const newBullets = [...proj.bullets]
  newBullets[bulletIndex] = value
  updateProject(projIndex, { bullets: newBullets })
}

const addProjectBullet = (projIndex) => {
  const proj = state.tailoredResume.projects[projIndex]
  updateProject(projIndex, { bullets: [...proj.bullets, ''] })
}

const removeProjectBullet = (projIndex, bulletIndex) => {
  const proj = state.tailoredResume.projects[projIndex]
  const newBullets = proj.bullets.filter((_, idx) => idx !== bulletIndex)
  updateProject(projIndex, { bullets: newBullets })
}
</script>

<style scoped>
.editor-container {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tabs-nav {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
  overflow-x: auto;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
}

.tab-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.tab-btn-active {
  background: var(--accent-light) !important;
  color: var(--accent-color) !important;
  border-color: var(--border-color) !important;
  box-shadow: 0 0 12px 0 var(--ring-color);
}

.tab-icon {
  width: 16px;
  height: 16px;
}

.panel-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

h3 {
  font-size: 20px;
  color: var(--text-primary);
}

.panel-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: -8px;
  margin-bottom: 8px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
@media (max-width: 640px) {
  .form-grid-2 {
    grid-template-columns: 1fr;
  }
}

.form-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 120px;
  gap: 16px;
}
@media (max-width: 768px) {
  .form-grid-3 {
    grid-template-columns: 1fr;
  }
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.list-item-card {
  padding: 20px;
  border-radius: 12px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

h4 {
  font-size: 15px;
  color: var(--text-primary);
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.action-btn:hover:not(:disabled) {
  border-color: var(--border-hover);
  color: var(--text-primary);
}
.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.danger-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1) !important;
  border-color: rgba(239, 68, 68, 0.2) !important;
  color: var(--danger-color) !important;
}

.mini-icon {
  width: 14px;
  height: 14px;
}

.bullets-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
  background: rgba(15, 23, 42, 0.01);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.dark .bullets-section {
  background: rgba(255, 255, 255, 0.01);
}

.bullets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h5 {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.add-bullet-btn {
  background: transparent;
  border: none;
  color: var(--accent-color);
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
.add-bullet-btn:hover {
  color: var(--accent-hover);
}

.bullets-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bullet-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bullet-number {
  font-size: 12px;
  color: var(--text-muted);
  width: 16px;
  text-align: right;
  flex-shrink: 0;
}

.bullet-input {
  flex-grow: 1;
}

.delete-bullet-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
}
.delete-bullet-btn:hover:not(:disabled) {
  color: var(--danger-color);
  background: rgba(239, 68, 68, 0.1);
}
.delete-bullet-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.micro-icon {
  width: 12px;
  height: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px;
  border: 1px dashed var(--border-color);
  border-radius: 12px;
  color: var(--text-secondary);
  text-align: center;
  background: rgba(15, 23, 42, 0.01);
}
.dark .empty-state {
  background: rgba(255, 255, 255, 0.01);
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--text-muted);
}

.mt-4 {
  margin-top: 16px;
}
</style>
