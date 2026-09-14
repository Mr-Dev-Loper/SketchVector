const TOOLS = [
    { id: 'select', icon: '\u2B55', label: 'Select', shortcut: 'V' },
    { id: 'pen', icon: '\u270E', label: 'Pen', shortcut: 'P' },
    { id: 'highlighter', icon: '\uD83D\uDD8C', label: 'Highlighter', shortcut: 'H' },
    { id: 'eraser', icon: '\u2B1B', label: 'Eraser', shortcut: 'E' },
    { id: 'line', icon: '\u2571', label: 'Line', shortcut: 'L' },
    { id: 'arrow', icon: '\u2192', label: 'Arrow', shortcut: 'A' },
    { id: 'rect', icon: '\u25A1', label: 'Rectangle', shortcut: 'R' },
    { id: 'circle', icon: '\u25CB', label: 'Circle', shortcut: 'C' },
    { id: 'diamond', icon: '\u25C7', label: 'Diamond', shortcut: 'D' },
    { id: 'text', icon: '\u270D', label: 'Text', shortcut: 'T' },
    { id: 'sticky', icon: '\uD83D\uDCDD', label: 'Sticky Note', shortcut: 'N' }
]

export default class Toolbar {
    constructor(options = {}) {
        this.activeTool = options.activeTool || 'select'
        this.onToolSelect = options.onToolSelect || (() => {})
        this.onUndo = options.onUndo || (() => {})
        this.onRedo = options.onRedo || (() => {})
        this.onZoomIn = options.onZoomIn || (() => {})
        this.onZoomOut = options.onZoomOut || (() => {})
        this.onZoomFit = options.onZoomFit || (() => {})
        this.onExport = options.onExport || (() => {})
        this.canUndo = false
        this.canRedo = false
        this.el = null
    }

    render() {
        this.el = document.createElement('div')
        this.el.className = 'sv-toolbar'
        this.el.innerHTML = `
            <div class="sv-toolbar__section sv-toolbar__tools"></div>
            <div class="sv-toolbar__section sv-toolbar__separator"></div>
            <div class="sv-toolbar__section sv-toolbar__history"></div>
            <div class="sv-toolbar__section sv-toolbar__separator"></div>
            <div class="sv-toolbar__section sv-toolbar__zoom"></div>
            <div class="sv-toolbar__section sv-toolbar__spacer"></div>
            <div class="sv-toolbar__section sv-toolbar__export"></div>
        `

        this._renderTools()
        this._renderHistory()
        this._renderZoom()
        this._renderExport()
        this._bindEvents()
        return this.el
    }

    _renderTools() {
        const container = this.el.querySelector('.sv-toolbar__tools')
        container.innerHTML = ''
        for (const tool of TOOLS) {
            const btn = document.createElement('button')
            btn.className = 'sv-toolbar__btn sv-toolbar__tool-btn'
            btn.dataset.tool = tool.id
            btn.title = `${tool.label} (${tool.shortcut})`
            btn.innerHTML = `<span class="sv-toolbar__icon">${tool.icon}</span>`
            if (tool.id === this.activeTool) btn.classList.add('sv-toolbar__btn--active')
            container.appendChild(btn)
        }
    }

    _renderHistory() {
        const container = this.el.querySelector('.sv-toolbar__history')
        container.innerHTML = `
            <button class="sv-toolbar__btn sv-toolbar__history-btn" data-action="undo" title="Undo (Ctrl+Z)" ${!this.canUndo ? 'disabled' : ''}>
                <span class="sv-toolbar__icon">\u21B6</span>
            </button>
            <button class="sv-toolbar__btn sv-toolbar__history-btn" data-action="redo" title="Redo (Ctrl+Shift+Z)" ${!this.canRedo ? 'disabled' : ''}>
                <span class="sv-toolbar__icon">\u21B7</span>
            </button>
        `
    }

    _renderZoom() {
        const container = this.el.querySelector('.sv-toolbar__zoom')
        container.innerHTML = `
            <button class="sv-toolbar__btn" data-action="zoom-out" title="Zoom Out">
                <span class="sv-toolbar__icon">\u2212</span>
            </button>
            <button class="sv-toolbar__btn" data-action="zoom-fit" title="Fit to Screen">
                <span class="sv-toolbar__icon">\u2B1C</span>
            </button>
            <button class="sv-toolbar__btn" data-action="zoom-in" title="Zoom In">
                <span class="sv-toolbar__icon">\u002B</span>
            </button>
        `
    }

    _renderExport() {
        const container = this.el.querySelector('.sv-toolbar__export')
        container.innerHTML = `
            <button class="sv-toolbar__btn sv-toolbar__export-btn" title="Export">
                <span class="sv-toolbar__icon">\u2913</span>
                <span class="sv-toolbar__btn-label">Export</span>
            </button>
            <div class="sv-toolbar__dropdown" style="display:none">
                <button class="sv-toolbar__dropdown-item" data-format="png">PNG</button>
                <button class="sv-toolbar__dropdown-item" data-format="svg">SVG</button>
                <button class="sv-toolbar__dropdown-item" data-format="json">JSON</button>
            </div>
        `
    }

    _bindEvents() {
        this.el.addEventListener('click', (e) => {
            const toolBtn = e.target.closest('[data-tool]')
            if (toolBtn) {
                this.setActiveTool(toolBtn.dataset.tool)
                return
            }

            const actionBtn = e.target.closest('[data-action]')
            if (actionBtn) {
                const action = actionBtn.dataset.action
                if (action === 'undo') this.onUndo()
                else if (action === 'redo') this.onRedo()
                else if (action === 'zoom-in') this.onZoomIn()
                else if (action === 'zoom-out') this.onZoomOut()
                else if (action === 'zoom-fit') this.onZoomFit()
                return
            }

            if (e.target.closest('.sv-toolbar__export-btn')) {
                const dropdown = this.el.querySelector('.sv-toolbar__dropdown')
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none'
                return
            }

            const dropItem = e.target.closest('.sv-toolbar__dropdown-item')
            if (dropItem) {
                this.onExport(dropItem.dataset.format)
                this.el.querySelector('.sv-toolbar__dropdown').style.display = 'none'
                return
            }
        })

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.sv-toolbar__export-btn') && !e.target.closest('.sv-toolbar__dropdown')) {
                const dropdown = this.el.querySelector('.sv-toolbar__dropdown')
                if (dropdown) dropdown.style.display = 'none'
            }
        })
    }

    setActiveTool(toolId) {
        this.activeTool = toolId
        this.el.querySelectorAll('[data-tool]').forEach(btn => {
            btn.classList.toggle('sv-toolbar__btn--active', btn.dataset.tool === toolId)
        })
        this.onToolSelect(toolId)
        document.dispatchEvent(new CustomEvent('tool-select', { detail: { tool: toolId } }))
    }

    setHistoryState(canUndo, canRedo) {
        this.canUndo = canUndo
        this.canRedo = canRedo
        const undoBtn = this.el.querySelector('[data-action="undo"]')
        const redoBtn = this.el.querySelector('[data-action="redo"]')
        if (undoBtn) undoBtn.disabled = !canUndo
        if (redoBtn) redoBtn.disabled = !canRedo
    }

    mount(parent) {
        if (!this.el) this.render()
        parent.appendChild(this.el)
        return this.el
    }
}
