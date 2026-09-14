const STORAGE_KEY = 'sketchvector_data'
const AUTO_SAVE_KEY = 'sketchvector_autosave'

export default class Storage {
    saveProject(name, state) {
        const projects = this._getProjects()
        projects[name] = { state, savedAt: Date.now() }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    }

    loadProject(name) {
        const projects = this._getProjects()
        return projects[name] ? projects[name].state : null
    }

    listProjects() {
        const projects = this._getProjects()
        return Object.keys(projects).map(name => ({
            name,
            savedAt: projects[name].savedAt
        }))
    }

    deleteProject(name) {
        const projects = this._getProjects()
        delete projects[name]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    }

    autoSave(state) {
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify({ state, savedAt: Date.now() }))
    }

    loadAutoSave() {
        const raw = localStorage.getItem(AUTO_SAVE_KEY)
        if (!raw) return null
        try {
            return JSON.parse(raw).state
        } catch {
            return null
        }
    }

    exportJSON(state) {
        return JSON.stringify(state, null, 2)
    }

    importJSON(json) {
        try {
            return JSON.parse(json)
        } catch {
            return null
        }
    }

    _getProjects() {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return {}
        try {
            return JSON.parse(raw)
        } catch {
            return {}
        }
    }
}
