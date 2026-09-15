const TOOLS = [
    { id: 'hand', label: 'Hand', shortcut: 'H', group: 'nav' },
    { id: 'select', label: 'Selection', shortcut: 'V', group: 'nav' },
    { id: 'rect', label: 'Rectangle', shortcut: 'R', group: 'shape' },
    { id: 'diamond', label: 'Diamond', shortcut: 'D', group: 'shape' },
    { id: 'circle', label: 'Ellipse', shortcut: 'O', group: 'shape' },
    { id: 'arrow', label: 'Arrow', shortcut: 'A', group: 'shape' },
    { id: 'line', label: 'Line', shortcut: 'L', group: 'shape' },
    { id: 'pen', label: 'Draw', shortcut: 'P', group: 'draw' },
    { id: 'text', label: 'Text', shortcut: 'T', group: 'draw' },
    { id: 'eraser', label: 'Eraser', shortcut: 'E', group: 'draw' },
]

const ICONS = {
    hand: `<svg viewBox="0 0 24 24"><path d="M18 11V6a2 2 0 0 0-4 0v1M14 10V4a2 2 0 0 0-4 0v6M10 9.5V5a2 2 0 0 0-4 0v9"/><path d="M18 11a2 2 0 0 1 4 0v3a8 8 0 0 1-8 8h-2c-2.5 0-4-.5-5.5-2L3.5 15a1.5 1.5 0 0 1 2-2L8 15"/><path d="M14 11.5V9a2 2 0 0 0-4 0"/></svg>`,
    select: `<svg viewBox="0 0 24 24"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>`,
    rect: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
    diamond: `<svg viewBox="0 0 24 24"><path d="M12 2l10 10-10 10L2 12z"/></svg>`,
    circle: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`,
    arrow: `<svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
    line: `<svg viewBox="0 0 24 24"><line x1="5" y1="19" x2="19" y2="5"/></svg>`,
    pen: `<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
    text: `<svg viewBox="0 0 24 24"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9.5" y1="20" x2="14.5" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`,
    eraser: `<svg viewBox="0 0 24 24"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>`,
    lock: `<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    menu: `<svg viewBox="0 0 24 24"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`,
    undo: `<svg viewBox="0 0 24 24"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>`,
    redo: `<svg viewBox="0 0 24 24"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>`,
    zoomIn: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
    zoomOut: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
    more: `<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>`,
    image: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
    export: `<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    import: `<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    file: `<svg viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    trash: `<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
}

export default class Toolbar {
    constructor(options = {}) {
        this.activeTool = options.activeTool || 'select'
        this.onToolSelect = options.onToolSelect || (() => {})
        this.onUndo = options.onUndo || (() => {})
        this.onRedo = options.onRedo || (() => {})
        this.onZoomIn = options.onZoomIn || (() => {})
        this.onZoomOut = options.onZoomOut || (() => {})
        this.onZoomFit = options.onZoomFit || (() => {})
        this.onThemeToggle = options.onThemeToggle || (() => {})
        this.onExport = options.onExport || (() => {})
        this.onImport = options.onImport || (() => {})
        this.canUndo = false
        this.canRedo = false
        this.el = null
        this.zoomLabel = null
        this.menuOpen = false
    }

    render() {
        this.el = document.createElement('div')
        this.el.className = 'sv-toolbar'
        this._renderTools()
        this._bindEvents()
        return this.el
    }

    _renderTools() {
        this.el.innerHTML = ''
        let lastGroup = null
        for (const tool of TOOLS) {
            if (lastGroup && tool.group !== lastGroup) {
                const div = document.createElement('div')
                div.className = 'sv-toolbar__divider'
                this.el.appendChild(div)
            }
            lastGroup = tool.group

            const btn = document.createElement('button')
            btn.className = 'sv-toolbar__btn'
            btn.dataset.tool = tool.id
            btn.title = `${tool.label} (${tool.shortcut})`
            btn.innerHTML = `${ICONS[tool.id] || ''}<span class="shortcut-badge">${tool.shortcut}</span>`
            if (tool.id === this.activeTool) btn.classList.add('sv-toolbar__btn--active')
            this.el.appendChild(btn)
        }

        const div = document.createElement('div')
        div.className = 'sv-toolbar__divider'
        this.el.appendChild(div)

        const moreBtn = document.createElement('button')
        moreBtn.className = 'sv-toolbar__btn'
        moreBtn.id = 'more-tools-btn'
        moreBtn.title = 'More tools'
        moreBtn.innerHTML = ICONS.more
        this.el.appendChild(moreBtn)

        const menu = document.createElement('div')
        menu.className = 'sv-toolbar-menu'
        menu.id = 'toolbar-menu'
        menu.innerHTML = `
            <button class="sv-toolbar-menu__item" data-menu="export-svg">${ICONS.export} Export SVG</button>
            <button class="sv-toolbar-menu__item" data-menu="export-png">${ICONS.image} Export PNG</button>
            <button class="sv-toolbar-menu__item" data-menu="export-project">${ICONS.file} Save .sketchvector</button>
            <button class="sv-toolbar-menu__divider"></button>
            <button class="sv-toolbar-menu__item" data-menu="import-project">${ICONS.import} Open .sketchvector</button>
        `
        this.el.appendChild(menu)
    }

    _bindEvents() {
        this.el.addEventListener('click', (e) => {
            const toolBtn = e.target.closest('[data-tool]')
            if (toolBtn) {
                this.setActiveTool(toolBtn.dataset.tool)
                return
            }
            const moreBtn = e.target.closest('#more-tools-btn')
            if (moreBtn) {
                this.menuOpen = !this.menuOpen
                document.getElementById('toolbar-menu')?.classList.toggle('sv-toolbar-menu--open', this.menuOpen)
                return
            }
            const menuItem = e.target.closest('[data-menu]')
            if (menuItem) {
                this.menuOpen = false
                document.getElementById('toolbar-menu')?.classList.remove('sv-toolbar-menu--open')
                const action = menuItem.dataset.menu
                if (action.startsWith('export-')) this.onExport(action.replace('export-', ''))
                else if (action === 'import-project') this.onImport()
                return
            }
            this.menuOpen = false
            document.getElementById('toolbar-menu')?.classList.remove('sv-toolbar-menu--open')
        })
    }

    setActiveTool(toolId) {
        this.activeTool = toolId
        this.el.querySelectorAll('[data-tool]').forEach(btn => {
            btn.classList.toggle('sv-toolbar__btn--active', btn.dataset.tool === toolId)
        })
        this.onToolSelect(toolId)
    }

    setHistoryState(canUndo, canRedo) {
        this.canUndo = canUndo
        this.canRedo = canRedo
    }

    mount(parent) {
        if (!this.el) this.render()
        parent.appendChild(this.el)
        return this.el
    }
}
