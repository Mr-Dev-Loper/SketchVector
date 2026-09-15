const STORAGE_KEY = 'sketchvector_projects'
const AUTOSAVE_KEY = 'sketchvector_autosave'

export default class Storage {
    saveProject(name, state) {
        const projects = this._getProjects()
        projects[name] = { state, savedAt: Date.now() }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    }

    loadProject(name) {
        const projects = this._getProjects()
        return projects[name]?.state || null
    }

    listProjects() {
        return Object.keys(this._getProjects())
    }

    deleteProject(name) {
        const projects = this._getProjects()
        delete projects[name]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    }

    autoSave(state) {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state))
    }

    loadAutoSave() {
        try {
            const data = localStorage.getItem(AUTOSAVE_KEY)
            return data ? JSON.parse(data) : null
        } catch { return null }
    }

    exportJSON(state) {
        return JSON.stringify(state, null, 2)
    }

    importJSON(json) {
        return JSON.parse(json)
    }

    _getProjects() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        } catch { return {} }
    }
}
