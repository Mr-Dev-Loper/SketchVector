const ICONS = {
    undo: `<svg viewBox="0 0 24 24"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>`,
    redo: `<svg viewBox="0 0 24 24"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>`,
    zoomIn: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
    zoomOut: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
}

export default class BottomBar {
    constructor(options = {}) {
        this.onUndo = options.onUndo || (() => {})
        this.onRedo = options.onRedo || (() => {})
        this.onZoomIn = options.onZoomIn || (() => {})
        this.onZoomOut = options.onZoomOut || (() => {})
        this.onZoomReset = options.onZoomReset || (() => {})
        this.getZoom = options.getZoom || (() => 1)
        this.canUndo = false
        this.canRedo = false
        this.leftEl = null
        this.rightEl = null
        this.zoomLabel = null
    }

    render() {
        this.leftEl = document.createElement('div')
        this.leftEl.className = 'sv-bottom-bar'

        this.leftEl.innerHTML = `
            <button class="sv-bottom-bar__btn" data-action="zoom-out" title="Zoom out">
                ${ICONS.zoomOut}
            </button>
            <span class="sv-zoom-label" data-action="zoom-reset" title="Reset zoom">100%</span>
            <button class="sv-bottom-bar__btn" data-action="zoom-in" title="Zoom in">
                ${ICONS.zoomIn}
            </button>
            <div class="sv-toolbar__divider" style="height:20px;margin:0 4px;"></div>
            <button class="sv-bottom-bar__btn" data-action="undo" title="Undo (Ctrl+Z)" disabled>
                ${ICONS.undo}
            </button>
            <button class="sv-bottom-bar__btn" data-action="redo" title="Redo (Ctrl+Shift+Z)" disabled>
                ${ICONS.redo}
            </button>
        `

        this.zoomLabel = this.leftEl.querySelector('.sv-zoom-label')
        this._bindEvents(this.leftEl)
        return this.leftEl
    }

    _bindEvents(container) {
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]')
            if (!btn) return
            const action = btn.dataset.action
            if (action === 'undo') this.onUndo()
            else if (action === 'redo') this.onRedo()
            else if (action === 'zoom-in') this.onZoomIn()
            else if (action === 'zoom-out') this.onZoomOut()
            else if (action === 'zoom-reset') this.onZoomReset()
        })
    }

    updateZoom(zoom, displayZoom) {
        if (this.zoomLabel) {
            this.zoomLabel.textContent = (displayZoom !== undefined ? displayZoom : Math.round(zoom * 100)) + '%'
        }
    }

    setHistoryState(canUndo, canRedo) {
        this.canUndo = canUndo
        this.canRedo = canRedo
        const undoBtn = this.leftEl?.querySelector('[data-action="undo"]')
        const redoBtn = this.leftEl?.querySelector('[data-action="redo"]')
        if (undoBtn) undoBtn.disabled = !canUndo
        if (redoBtn) redoBtn.disabled = !canRedo
    }

    mount(parent) {
        if (!this.leftEl) this.render()
        parent.appendChild(this.leftEl)
        return this.leftEl
    }
}
