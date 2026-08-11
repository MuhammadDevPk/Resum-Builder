import { reactive, readonly } from 'vue'

const LOCAL_STORAGE_KEY = 'ai_resume_builder_state'

const defaultState = () => ({
  rawResumeText: '',
  jobDescription: '',
  customInstructions: '',
  isParsing: false,
  isTailoring: false,
  parseError: null,
  tailorError: null,
  tailoredResume: {
    personal: {
      name: '',
      email: '',
      phone: '',
      website: '',
      github: '',
      linkedin: '',
      location: ''
    },
    summary: '',
    skills: [
      { category: 'Languages', values: [] },
      { category: 'Frameworks/Libraries', values: [] },
      { category: 'Tools/DevOps', values: [] }
    ],
    experience: [],
    projects: [],
    education: []
  }
})

const state = reactive(defaultState())

// Local storage helper
const saveToLocalStorage = () => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      rawResumeText: state.rawResumeText,
      jobDescription: state.jobDescription,
      customInstructions: state.customInstructions,
      tailoredResume: state.tailoredResume
    }))
  } catch (e) {
    console.error('Failed to save state to localStorage:', e)
  }
}

// Actions
const setRawResumeText = (text) => {
  state.rawResumeText = text
  saveToLocalStorage()
}

const setJobDescription = (jd) => {
  state.jobDescription = jd
  saveToLocalStorage()
}

const setCustomInstructions = (inst) => {
  state.customInstructions = inst
  saveToLocalStorage()
}

const setIsParsing = (val) => {
  state.isParsing = val
}

const setIsTailoring = (val) => {
  state.isTailoring = val
}

const setParseError = (err) => {
  state.parseError = err
}

const setTailorError = (err) => {
  state.tailorError = err
}

const setTailoredResume = (data) => {
  if (!data) return

  state.tailoredResume.personal = {
    name: data.personal?.name || '',
    email: data.personal?.email || '',
    phone: data.personal?.phone || '',
    website: data.personal?.website || '',
    github: data.personal?.github || '',
    linkedin: data.personal?.linkedin || '',
    location: data.personal?.location || ''
  }

  state.tailoredResume.summary = data.summary || ''

  if (Array.isArray(data.skills)) {
    const isStructured = data.skills.length > 0 &&
                         typeof data.skills[0] === 'object' &&
                         data.skills[0] !== null &&
                         'category' in data.skills[0]

    if (isStructured) {
      // Each item is { category: string, values: string[] }
      // Defensively coerce every value to a plain string to prevent [object Object]
      state.tailoredResume.skills = data.skills.map(s => ({
        category: typeof s.category === 'string' ? s.category : String(s.category || ''),
        values: Array.isArray(s.values)
          ? s.values.map(v => (typeof v === 'string' ? v : (typeof v === 'object' && v !== null ? (v.name || v.value || v.label || JSON.stringify(v)) : String(v))))
          : []
      }))
    } else {
      // Flat string array — wrap under a single 'Skills' category
      state.tailoredResume.skills = [{
        category: 'Skills',
        values: data.skills.map(v => (typeof v === 'string' ? v : String(v)))
      }]
    }
  } else if (typeof data.skills === 'object' && data.skills !== null) {
    // Object map: { Languages: ['PHP', 'JS'], ... }
    state.tailoredResume.skills = Object.entries(data.skills).map(([category, values]) => ({
      category,
      values: Array.isArray(values)
        ? values.map(v => (typeof v === 'string' ? v : String(v)))
        : [String(values)]
    }))
  } else {
    state.tailoredResume.skills = []
  }

  state.tailoredResume.experience = (data.experience || []).map(exp => ({
    role: exp.role || '',
    company: exp.company || '',
    duration: exp.duration || '',
    bullets: Array.isArray(exp.bullets) ? exp.bullets : []
  }))

  state.tailoredResume.projects = (data.projects || []).map(proj => ({
    name: proj.name || '',
    technologies: Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || ''),
    duration: proj.duration || '',
    description: proj.description || '',
    bullets: Array.isArray(proj.bullets) ? proj.bullets : []
  }))

  state.tailoredResume.education = (data.education || []).map(edu => ({
    degree: edu.degree || '',
    school: edu.school || '',
    duration: edu.duration || ''
  }))

  saveToLocalStorage()
}

const updatePersonal = (field, value) => {
  if (Object.prototype.hasOwnProperty.call(state.tailoredResume.personal, field)) {
    state.tailoredResume.personal[field] = value
    saveToLocalStorage()
  }
}

const updateSummary = (text) => {
  state.tailoredResume.summary = text
  saveToLocalStorage()
}

const updateExperience = (index, updatedExp) => {
  state.tailoredResume.experience[index] = { ...state.tailoredResume.experience[index], ...updatedExp }
  saveToLocalStorage()
}

const addExperienceItem = () => {
  state.tailoredResume.experience.push({
    role: '',
    company: '',
    duration: '',
    bullets: ['']
  })
  saveToLocalStorage()
}

const removeExperienceItem = (index) => {
  state.tailoredResume.experience.splice(index, 1)
  saveToLocalStorage()
}

const updateProject = (index, updatedProj) => {
  state.tailoredResume.projects[index] = { ...state.tailoredResume.projects[index], ...updatedProj }
  saveToLocalStorage()
}

const addProjectItem = () => {
  state.tailoredResume.projects.push({
    name: '',
    technologies: '',
    duration: '',
    description: '',
    bullets: ['']
  })
  saveToLocalStorage()
}

const removeProjectItem = (index) => {
  state.tailoredResume.projects.splice(index, 1)
  saveToLocalStorage()
}

const updateSkillCategory = (index, category) => {
  state.tailoredResume.skills[index].category = category
  saveToLocalStorage()
}

const updateSkillValues = (index, values) => {
  state.tailoredResume.skills[index].values = Array.isArray(values)
    ? values
    : values.split(',').map(s => s.trim()).filter(Boolean)
  saveToLocalStorage()
}

const addSkillCategory = () => {
  state.tailoredResume.skills.push({ category: '', values: [] })
  saveToLocalStorage()
}

const removeSkillCategory = (index) => {
  state.tailoredResume.skills.splice(index, 1)
  saveToLocalStorage()
}

const updateEducation = (index, updatedEdu) => {
  state.tailoredResume.education[index] = { ...state.tailoredResume.education[index], ...updatedEdu }
  saveToLocalStorage()
}

const addEducationItem = () => {
  state.tailoredResume.education.push({
    degree: '',
    school: '',
    duration: ''
  })
  saveToLocalStorage()
}

const removeEducationItem = (index) => {
  state.tailoredResume.education.splice(index, 1)
  saveToLocalStorage()
}

const setExperienceList = (list) => {
  state.tailoredResume.experience = list
  saveToLocalStorage()
}

const setProjectsList = (list) => {
  state.tailoredResume.projects = list
  saveToLocalStorage()
}

const setSkillsList = (list) => {
  state.tailoredResume.skills = list
  saveToLocalStorage()
}

const setEducationList = (list) => {
  state.tailoredResume.education = list
  saveToLocalStorage()
}

const resetStore = () => {
  const defaults = defaultState()
  Object.keys(defaults).forEach(key => {
    state[key] = defaults[key]
  })
  localStorage.removeItem(LOCAL_STORAGE_KEY)
}

const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (parsed.rawResumeText) state.rawResumeText = parsed.rawResumeText
      if (parsed.jobDescription) state.jobDescription = parsed.jobDescription
      if (parsed.customInstructions) state.customInstructions = parsed.customInstructions

      // ── CRITICAL FIX: route cached tailoredResume through setTailoredResume ──
      // A direct shallow merge (spread) bypasses all sanitization logic and
      // can restore corrupted/stale objects (e.g. skills with [object Object])
      // from older localStorage snapshots. Always sanitize on restore.
      if (parsed.tailoredResume) {
        setTailoredResume(parsed.tailoredResume)
      }
    }
  } catch (e) {
    console.error('Failed to load state from localStorage:', e)
  }
}

export const useResumeStore = () => {
  return {
    state: readonly(state),
    setRawResumeText,
    setJobDescription,
    setCustomInstructions,
    setIsParsing,
    setIsTailoring,
    setParseError,
    setTailorError,
    setTailoredResume,
    updatePersonal,
    updateSummary,
    updateExperience,
    addExperienceItem,
    removeExperienceItem,
    updateProject,
    addProjectItem,
    removeProjectItem,
    updateSkillCategory,
    updateSkillValues,
    addSkillCategory,
    removeSkillCategory,
    updateEducation,
    addEducationItem,
    removeEducationItem,
    setExperienceList,
    setProjectsList,
    setSkillsList,
    setEducationList,
    resetStore,
    loadFromLocalStorage
  }
}
