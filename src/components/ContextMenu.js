export default class ContextMenu {
    constructor(options = {}) {
        this.onDuplicate = options.onDuplicate || (() => {})
        this.onCopy = options.onCopy || (() => {})
        this.onPaste = options.onPaste || (() => {})
        this.onDelete = options.onDelete || (() => {})
        this.onExport = options.onExport || (() => {})
        this.el = null
        this.visible = false
    }

    render() {
        this.el = document.createElement('div')
        this.el.className = 'sv-context-menu'
        this.el.innerHTML = `
            <button class="sv-context-menu__item" data-action="copy">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy
            </button>
            <button class="sv-context-menu__item" data-action="paste">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
                Paste
            </button>
            <button class="sv-context-menu__item" data-action="duplicate">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>
                Duplicate
            </button>
            <div class="sv-context-menu__divider"></div>
            <button class="sv-context-menu__item" data-action="export">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export
            </button>
            <div class="sv-context-menu__divider"></div>
            <button class="sv-context-menu__item sv-context-menu__item--danger" data-action="delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Delete
            </button>
        `
        document.body.appendChild(this.el)
        this._bindEvents()
    }

    _bindEvents() {
        this.el.addEventListener('click', (e) => {
            const item = e.target.closest('[data-action]')
            if (!item) return
            const action = item.dataset.action
            if (action === 'copy') this.onCopy()
            else if (action === 'paste') this.onPaste()
            else if (action === 'duplicate') this.onDuplicate()
            else if (action === 'delete') this.onDelete()
            else if (action === 'export') this.onExport()
            this.hide()
        })
    }

    show(x, y) {
        if (!this.el) this.render()
        this.visible = true
        this.el.style.display = 'flex'
        this.el.style.left = x + 'px'
        this.el.style.top = y + 'px'

        const rect = this.el.getBoundingClientRect()
        if (rect.right > window.innerWidth) this.el.style.left = (x - rect.width) + 'px'
        if (rect.bottom > window.innerHeight) this.el.style.top = (y - rect.height) + 'px'
    }

    hide() {
        if (!this.el) return
        this.visible = false
        this.el.style.display = 'none'
    }
}
