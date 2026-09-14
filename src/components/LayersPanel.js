const SHAPE_ICONS = {
    rect: '\u25A1',
    circle: '\u25CB',
    line: '\u2571',
    arrow: '\u2192',
    path: '\u270E',
    text: '\u270D',
    diamond: '\u25C7',
    sticky: '\uD83D\uDCDD',
    highlighter: '\uD83D\uDD8C'
}

export default class LayersPanel {
    constructor(options = {}) {
        this.shapes = options.shapes || []
        this.layers = options.layers || [{ id: 'default', name: 'Layer 1', visible: true, locked: false }]
        this.selectedIds = options.selectedIds || []
        this.onSelect = options.onSelect || (() => {})
        this.onToggleVisibility = options.onToggleVisibility || (() => {})
        this.onToggleLock = options.onToggleLock || (() => {})
        this.onDelete = options.onDelete || (() => {})
        this.onAddLayer = options.onAddLayer || (() => {})
        this.onOpacityChange = options.onOpacityChange || (() => {})
        this.el = null
    }

    render() {
        this.el = document.createElement('div')
        this.el.className = 'sv-layers-panel'
        this.el.innerHTML = `
            <div class="sv-layers-panel__header">
                <span>Layers</span>
                <div class="sv-layers-panel__actions">
                    <button class="sv-layers-panel__btn" data-action="add" title="Add Layer">+</button>
                    <button class="sv-layers-panel__btn" data-action="delete" title="Delete Selected">\u2212</button>
                </div>
            </div>
            <div class="sv-layers-panel__body">
                <div class="sv-layers-panel__list"></div>
            </div>
            <div class="sv-layers-panel__footer">
                <label>Opacity</label>
                <input type="range" class="sv-layers-panel__opacity" min="0" max="100" value="100" />
                <span class="sv-layers-panel__opacity-val">100%</span>
            </div>
        `
        this._renderList()
        this._bindEvents()
        return this.el
    }

    _renderList() {
        const list = this.el.querySelector('.sv-layers-panel__list')
        list.innerHTML = ''

        for (const layer of this.layers) {
            const layerEl = document.createElement('div')
            layerEl.className = 'sv-layers-panel__layer'
            layerEl.dataset.layerId = layer.id
            layerEl.innerHTML = `
                <span class="sv-layers-panel__layer-icon">\uD83D\uDCC1</span>
                <span class="sv-layers-panel__layer-name">${layer.name}</span>
                <button class="sv-layers-panel__layer-btn" data-action="visibility" data-layer-id="${layer.id}" title="Toggle visibility">
                    ${layer.visible ? '\uD83D\uDC41' : '\u25CB'}
                </button>
                <button class="sv-layers-panel__layer-btn" data-action="lock" data-layer-id="${layer.id}" title="Toggle lock">
                    ${layer.locked ? '\uD83D\uDD12' : '\uD83D\uDD13'}
                </button>
            `
            list.appendChild(layerEl)
        }

        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i]
            const itemEl = document.createElement('div')
            itemEl.className = 'sv-layers-panel__item'
            if (this.selectedIds.includes(shape.id)) itemEl.classList.add('sv-layers-panel__item--selected')
            itemEl.dataset.shapeId = shape.id
            itemEl.innerHTML = `
                <span class="sv-layers-panel__item-icon">${SHAPE_ICONS[shape.type] || '\u25A1'}</span>
                <span class="sv-layers-panel__item-name">${shape.name || shape.type}</span>
                <button class="sv-layers-panel__item-btn" data-action="shape-visibility" data-shape-id="${shape.id}" title="Toggle visibility">
                    ${shape.visible !== false ? '\uD83D\uDC41' : '\u25CB'}
                </button>
                <button class="sv-layers-panel__item-btn" data-action="shape-lock" data-shape-id="${shape.id}" title="Toggle lock">
                    ${shape.locked ? '\uD83D\uDD12' : '\uD83D\uDD13'}
                </button>
            `
            list.appendChild(itemEl)
        }
    }

    _bindEvents() {
        this.el.addEventListener('click', (e) => {
            const itemBtn = e.target.closest('[data-action="shape-visibility"]')
            if (itemBtn) {
                this.onToggleVisibility(itemBtn.dataset.shapeId)
                return
            }

            const lockBtn = e.target.closest('[data-action="shape-lock"]')
            if (lockBtn) {
                this.onToggleLock(lockBtn.dataset.shapeId)
                return
            }

            const layerVisBtn = e.target.closest('[data-action="visibility"]')
            if (layerVisBtn) {
                this.onToggleVisibility(layerVisBtn.dataset.layerId)
                return
            }

            const layerLockBtn = e.target.closest('[data-action="lock"]')
            if (layerLockBtn) {
                this.onToggleLock(layerLockBtn.dataset.layerId)
                return
            }

            const actionBtn = e.target.closest('[data-action="add"], [data-action="delete"]')
            if (actionBtn) {
                if (actionBtn.dataset.action === 'add') this.onAddLayer()
                else if (actionBtn.dataset.action === 'delete') {
                    this.selectedIds.forEach(id => this.onDelete(id))
                }
                return
            }

            const item = e.target.closest('.sv-layers-panel__item')
            if (item && !e.target.closest('.sv-layers-panel__item-btn')) {
                this.onSelect(item.dataset.shapeId)
            }
        })

        const opacitySlider = this.el.querySelector('.sv-layers-panel__opacity')
        const opacityVal = this.el.querySelector('.sv-layers-panel__opacity-val')
        opacitySlider.addEventListener('input', (e) => {
            opacityVal.textContent = e.target.value + '%'
            this.onOpacityChange(parseInt(e.target.value) / 100)
        })
    }

    update(shapes, layers, selectedIds) {
        this.shapes = shapes || this.shapes
        this.layers = layers || this.layers
        this.selectedIds = selectedIds || this.selectedIds
        this._renderList()
    }

    mount(parent) {
        if (!this.el) this.render()
        parent.appendChild(this.el)
        return this.el
    }
}
