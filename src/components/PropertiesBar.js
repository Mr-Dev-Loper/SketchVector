const STROKE_COLORS = ['#1e1e1e', '#e03131', '#2f9e44', '#1971c2', '#e8590c', '#862e9c']
const FILL_COLORS = ['transparent', '#ffc9c9', '#b2f2bb', '#a5d8ff', '#ffec99', '#d0bfff', '#fcc2d7']
const STROKE_WIDTHS = [
    { label: 'Thin', value: 1, svg: '<svg width="20" height="10"><line x1="2" y1="5" x2="18" y2="5" stroke="currentColor" stroke-width="1"/></svg>' },
    { label: 'Medium', value: 2, svg: '<svg width="20" height="10"><line x1="2" y1="5" x2="18" y2="5" stroke="currentColor" stroke-width="2.5"/></svg>' },
    { label: 'Bold', value: 4, svg: '<svg width="20" height="10"><line x1="2" y1="5" x2="18" y2="5" stroke="currentColor" stroke-width="4"/></svg>' },
]
const STROKE_STYLES = [
    { label: 'Solid', value: 'solid', svg: '<svg width="20" height="10"><line x1="2" y1="5" x2="18" y2="5" stroke="currentColor" stroke-width="2"/></svg>' },
    { label: 'Dashed', value: 'dashed', svg: '<svg width="20" height="10"><line x1="2" y1="5" x2="18" y2="5" stroke="currentColor" stroke-width="2" stroke-dasharray="4 3"/></svg>' },
    { label: 'Dotted', value: 'dotted', svg: '<svg width="20" height="10"><line x1="2" y1="5" x2="18" y2="5" stroke="currentColor" stroke-width="2" stroke-dasharray="2 3"/></svg>' },
]
const EDGES = [
    { label: 'Sharp', value: 'sharp', svg: '<svg width="16" height="16"><rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>' },
    { label: 'Round', value: 'round', svg: '<svg width="16" height="16"><rect x="2" y="2" width="12" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>' },
]
const FONTS = [
    { label: 'Hand', value: "'Excalifont', cursive", icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>' },
    { label: 'Serif', value: 'Georgia, serif', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>' },
    { label: 'Code', value: "'Courier New', monospace", icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>' },
    { label: 'Sans', value: 'Arial, sans-serif', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9.5" y1="20" x2="14.5" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>' },
]
const FONT_SIZES = [
    { label: 'S', value: 14 },
    { label: 'M', value: 20 },
    { label: 'L', value: 28 },
    { label: 'XL', value: 36 },
]
const TEXT_ALIGN = [
    { label: 'Left', value: 'left', svg: '<svg width="16" height="14"><line x1="2" y1="2" x2="14" y2="2" stroke="currentColor" stroke-width="1.5"/><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" stroke-width="1.5"/><line x1="2" y1="10" x2="14" y2="10" stroke="currentColor" stroke-width="1.5"/></svg>' },
    { label: 'Center', value: 'center', svg: '<svg width="16" height="14"><line x1="2" y1="2" x2="14" y2="2" stroke="currentColor" stroke-width="1.5"/><line x1="4" y1="6" x2="12" y2="6" stroke="currentColor" stroke-width="1.5"/><line x1="2" y1="10" x2="14" y2="10" stroke="currentColor" stroke-width="1.5"/></svg>' },
    { label: 'Right', value: 'right', svg: '<svg width="16" height="14"><line x1="2" y1="2" x2="14" y2="2" stroke="currentColor" stroke-width="1.5"/><line x1="6" y1="6" x2="14" y2="6" stroke="currentColor" stroke-width="1.5"/><line x1="2" y1="10" x2="14" y2="10" stroke="currentColor" stroke-width="1.5"/></svg>' },
]

const TOOL_PANELS = {
    rect: ['stroke', 'fill', 'strokeWidth', 'strokeStyle', 'edges', 'opacity'],
    circle: ['stroke', 'fill', 'strokeWidth', 'strokeStyle', 'opacity'],
    diamond: ['stroke', 'fill', 'strokeWidth', 'strokeStyle', 'opacity'],
    line: ['stroke', 'strokeWidth', 'strokeStyle', 'opacity'],
    arrow: ['stroke', 'strokeWidth', 'strokeStyle', 'opacity'],
    pen: ['stroke', 'strokeWidth', 'opacity'],
    text: ['stroke', 'fontFamily', 'fontSize', 'textAlign', 'opacity'],
    select: [],
    hand: [],
    eraser: [],
}

const SHAPE_PANELS = {
    rect: ['stroke', 'fill', 'strokeWidth', 'strokeStyle', 'edges', 'opacity'],
    circle: ['stroke', 'fill', 'strokeWidth', 'strokeStyle', 'opacity'],
    diamond: ['stroke', 'fill', 'strokeWidth', 'strokeStyle', 'opacity'],
    line: ['stroke', 'strokeWidth', 'strokeStyle', 'opacity'],
    arrow: ['stroke', 'strokeWidth', 'strokeStyle', 'opacity'],
    path: ['stroke', 'strokeWidth', 'opacity'],
    text: ['stroke', 'fontFamily', 'fontSize', 'textAlign', 'opacity'],
    eraser: [],
}

export default class PropertiesBar {
    constructor(options = {}) {
        this.onChange = options.onChange || (() => {})
        this.onLayerAction = options.onLayerAction || (() => {})
        this.onDelete = options.onDelete || (() => {})
        this.el = null
        this.visible = false
        this.currentShape = null
        this.toolMode = null
    }

    render() {
        this.el = document.createElement('div')
        this.el.className = 'sv-props-panel'
        document.body.appendChild(this.el)
        return this.el
    }

    showForTool(toolName, defaults) {
        const sections = TOOL_PANELS[toolName]
        if (!sections || sections.length === 0) { this.hide(); return }
        this.toolMode = toolName
        this.currentShape = null
        if (!this.el) this.render()
        this.visible = true
        this.el.style.display = 'block'
        this._defaults = defaults
        this.el.innerHTML = this._buildPanel(sections, defaults)
        this._bindEvents()
    }

    show(shape) {
        const type = shape.type === 'path' ? 'path' : shape.type
        const sections = SHAPE_PANELS[type] || SHAPE_PANELS.rect
        this.toolMode = null
        if (!this.el) this.render()
        this.currentShape = shape
        this.visible = true
        this.el.style.display = 'block'
        this.el.innerHTML = this._buildPanel(sections, shape)
        this._bindEvents()
    }

    hide() {
        if (!this.el) return
        this.visible = false
        this.el.style.display = 'none'
        this.currentShape = null
        this.toolMode = null
    }

    _buildPanel(sections, data) {
        return sections.map(s => {
            switch (s) {
                case 'stroke': return this._colorSection('Stroke', 'stroke', data.stroke || '#1e1e1e', STROKE_COLORS)
                case 'fill': return this._colorSection('Background', 'fill', data.fill || 'transparent', FILL_COLORS)
                case 'strokeWidth': return this._btnGroupSection('Stroke width', 'strokeWidth', data.strokeWidth || 2, STROKE_WIDTHS)
                case 'strokeStyle': return this._btnGroupSection('Stroke style', 'strokeStyle', data.strokeStyle || 'solid', STROKE_STYLES)
                case 'edges': return this._btnGroupSection('Edges', 'edges', data.edges || 'sharp', EDGES)
                case 'fontFamily': return this._fontSection('Font family', 'fontFamily', data.fontFamily || FONTS[0].value)
                case 'fontSize': return this._btnGroupSection('Font size', 'fontSize', data.fontSize || 20, FONT_SIZES)
                case 'textAlign': return this._btnGroupSection('Text align', 'textAlign', data.textAlign || 'left', TEXT_ALIGN)
                case 'opacity': return this._sliderSection('Opacity', 'opacity', data.opacity !== undefined ? data.opacity : 1)
                case 'layers': return this._layerActions()
                default: return ''
            }
        }).join('')
    }

    _colorSection(label, prop, current, colors) {
        return `
            <div class="sv-props-section">
                <div class="sv-props-label">${label}</div>
                <div class="sv-props-colors">
                    ${colors.map(c => `
                        <button class="sv-props-color ${c === current ? 'active' : ''}" data-prop="${prop}" data-value="${c}" style="background:${c === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 8px 8px' : c};${c === current ? 'outline:2px solid var(--accent);outline-offset:1px;' : ''}">
                            ${c === 'transparent' ? '<svg width="12" height="12" style="position:absolute;"><line x1="2" y1="10" x2="10" y2="2" stroke="#e03131" stroke-width="1.5"/></svg>' : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `
    }

    _btnGroupSection(label, prop, current, items) {
        return `
            <div class="sv-props-section">
                <div class="sv-props-label">${label}</div>
                <div class="sv-props-btn-group">
                    ${items.map(i => `
                        <button class="sv-props-btn ${i.value === current ? 'active' : ''}" data-prop="${prop}" data-value="${i.value}" title="${i.label}">
                            ${i.svg || i.label}
                        </button>
                    `).join('')}
                </div>
            </div>
        `
    }

    _fontSection(label, prop, current) {
        return `
            <div class="sv-props-section">
                <div class="sv-props-label">${label}</div>
                <div class="sv-props-btn-group">
                    ${FONTS.map(f => `
                        <button class="sv-props-btn ${f.value === current ? 'active' : ''}" data-prop="${prop}" data-value="${f.value}" title="${f.label}">
                            ${f.icon}
                        </button>
                    `).join('')}
                </div>
            </div>
        `
    }

    _sliderSection(label, prop, current) {
        return `
            <div class="sv-props-section">
                <div class="sv-props-label">${label} <span class="sv-props-opacity-val">${Math.round(current * 100)}%</span></div>
                <input type="range" class="sv-props-slider" data-prop="${prop}" min="0" max="1" step="0.01" value="${current}">
            </div>
        `
    }

    _layerActions() {
        return `
            <div class="sv-props-section sv-props-actions">
                <div class="sv-props-label">Layers</div>
                <div class="sv-props-btn-group">
                    <button class="sv-props-btn" data-layer="toBack" title="Send to back">
                        <svg width="16" height="16"><rect x="6" y="6" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="2" y="2" width="8" height="8" fill="var(--canvas-bg)" stroke="currentColor" stroke-width="1.2"/></svg>
                    </button>
                    <button class="sv-props-btn" data-layer="backward" title="Send backward">
                        <svg width="16" height="16"><rect x="5" y="5" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="3" y="3" width="8" height="8" fill="var(--canvas-bg)" stroke="currentColor" stroke-width="1.2"/></svg>
                    </button>
                    <button class="sv-props-btn" data-layer="forward" title="Bring forward">
                        <svg width="16" height="16"><rect x="3" y="3" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="5" y="5" width="8" height="8" fill="var(--canvas-bg)" stroke="currentColor" stroke-width="1.2"/></svg>
                    </button>
                    <button class="sv-props-btn" data-layer="toFront" title="Bring to front">
                        <svg width="16" height="16"><rect x="2" y="2" width="8" height="8" fill="var(--canvas-bg)" stroke="currentColor" stroke-width="1.2"/><rect x="6" y="6" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>
                    </button>
                </div>
                <div class="sv-props-btn-group" style="margin-left:auto;">
                    <button class="sv-props-btn sv-props-delete" data-layer="delete" title="Delete">
                        <svg width="16" height="16"><polyline points="3,4 8,9 13,4" fill="none" stroke="currentColor" stroke-width="1.5"/><polyline points="3,12 8,7 13,12" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
                    </button>
                </div>
            </div>
        `
    }

    _bindEvents() {
        this.el.querySelectorAll('[data-prop]').forEach(btn => {
            btn.addEventListener('click', () => {
                const prop = btn.dataset.prop
                let val = btn.dataset.value
                if (['strokeWidth', 'fontSize'].includes(prop)) val = Number(val)
                else if (prop === 'opacity') return
                this.onChange(prop, val)
                if (this.currentShape) {
                    this.show({ ...this.currentShape, [prop]: val })
                } else if (this.toolMode) {
                    this._defaults = { ...this._defaults, [prop]: val }
                    this.showForTool(this.toolMode, this._defaults)
                }
            })
        })

        this.el.querySelectorAll('[data-layer]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.layer === 'delete') this.onDelete()
                else this.onLayerAction(btn.dataset.layer)
            })
        })

        const slider = this.el.querySelector('.sv-props-slider')
        if (slider) {
            slider.addEventListener('input', (e) => {
                const val = Number(e.target.value)
                const label = this.el.querySelector('.sv-props-opacity-val')
                if (label) label.textContent = Math.round(val * 100) + '%'
                this.onChange('opacity', val)
            })
        }
    }

    mount(parent) {
        if (!this.el) this.render()
        return this.el
    }
}
