import ColorPicker from './ColorPicker.js'

export default class PropertiesPanel {
    constructor(options = {}) {
        this.state = options.state || {}
        this.onChange = options.onChange || (() => {})
        this.collapsed = false
        this.el = null
        this.fillPicker = null
        this.strokePicker = null
    }

    render() {
        this.el = document.createElement('div')
        this.el.className = 'sv-properties-panel'
        this.el.innerHTML = `
            <div class="sv-properties-panel__header">
                <span>Properties</span>
                <button class="sv-properties-panel__toggle" title="Toggle panel">\u25B6</button>
            </div>
            <div class="sv-properties-panel__body">
                <div class="sv-properties-panel__group">
                    <div class="sv-properties-panel__row" id="sv-pp-fill"></div>
                    <div class="sv-properties-panel__row" id="sv-pp-stroke"></div>
                </div>
                <div class="sv-properties-panel__group">
                    <div class="sv-properties-panel__row">
                        <label>Stroke Width</label>
                        <div class="sv-properties-panel__slider-wrap">
                            <input type="range" class="sv-properties-panel__range" id="sv-pp-stroke-width" min="1" max="20" value="${this.state.strokeWidth || 2}" />
                            <span id="sv-pp-stroke-width-val">${this.state.strokeWidth || 2}px</span>
                        </div>
                    </div>
                    <div class="sv-properties-panel__row">
                        <label>Opacity</label>
                        <div class="sv-properties-panel__slider-wrap">
                            <input type="range" class="sv-properties-panel__range" id="sv-pp-opacity" min="0" max="100" value="${Math.round((this.state.opacity ?? 1) * 100)}" />
                            <span id="sv-pp-opacity-val">${Math.round((this.state.opacity ?? 1) * 100)}%</span>
                        </div>
                    </div>
                </div>
                <div class="sv-properties-panel__group">
                    <div class="sv-properties-panel__row">
                        <label>Font Size</label>
                        <input type="number" class="sv-properties-panel__input" id="sv-pp-font-size" min="8" max="200" value="${this.state.fontSize || 16}" />
                    </div>
                </div>
                <div class="sv-properties-panel__group">
                    <div class="sv-properties-panel__row">
                        <label>
                            <input type="checkbox" id="sv-pp-hand-drawn" ${this.state.handDrawn ? 'checked' : ''} />
                            Hand-drawn style
                        </label>
                    </div>
                </div>
                <div class="sv-properties-panel__group sv-properties-panel__group--position">
                    <div class="sv-properties-panel__row">
                        <label>X</label>
                        <input type="number" class="sv-properties-panel__input sv-properties-panel__input--sm" id="sv-pp-x" value="${this.state.x || 0}" />
                        <label>Y</label>
                        <input type="number" class="sv-properties-panel__input sv-properties-panel__input--sm" id="sv-pp-y" value="${this.state.y || 0}" />
                    </div>
                    <div class="sv-properties-panel__row">
                        <label>W</label>
                        <input type="number" class="sv-properties-panel__input sv-properties-panel__input--sm" id="sv-pp-w" value="${this.state.width || 0}" />
                        <label>H</label>
                        <input type="number" class="sv-properties-panel__input sv-properties-panel__input--sm" id="sv-pp-h" value="${this.state.height || 0}" />
                    </div>
                </div>
            </div>
        `

        this._createColorPickers()
        this._bindEvents()
        return this.el
    }

    _createColorPickers() {
        this.fillPicker = new ColorPicker({
            label: 'Fill',
            value: this.state.fill || 'transparent',
            onChange: (color) => this._emit('fill', color)
        })
        const fillRow = this.el.querySelector('#sv-pp-fill')
        fillRow.innerHTML = ''
        fillRow.appendChild(this.fillPicker.render())

        this.strokePicker = new ColorPicker({
            label: 'Stroke',
            value: this.state.stroke || '#000000',
            onChange: (color) => this._emit('stroke', color)
        })
        const strokeRow = this.el.querySelector('#sv-pp-stroke')
        strokeRow.innerHTML = ''
        strokeRow.appendChild(this.strokePicker.render())
    }

    _emit(prop, value) {
        this.onChange(prop, value)
    }

    _bindEvents() {
        const toggle = this.el.querySelector('.sv-properties-panel__toggle')
        toggle.addEventListener('click', () => {
            this.collapsed = !this.collapsed
            this.el.classList.toggle('sv-properties-panel--collapsed', this.collapsed)
            toggle.textContent = this.collapsed ? '\u25B6' : '\u25BC'
        })

        this.el.querySelector('#sv-pp-stroke-width').addEventListener('input', (e) => {
            this.el.querySelector('#sv-pp-stroke-width-val').textContent = e.target.value + 'px'
            this._emit('strokeWidth', parseInt(e.target.value))
        })

        this.el.querySelector('#sv-pp-opacity').addEventListener('input', (e) => {
            this.el.querySelector('#sv-pp-opacity-val').textContent = e.target.value + '%'
            this._emit('opacity', parseInt(e.target.value) / 100)
        })

        this.el.querySelector('#sv-pp-font-size').addEventListener('change', (e) => {
            this._emit('fontSize', parseInt(e.target.value))
        })

        this.el.querySelector('#sv-pp-hand-drawn').addEventListener('change', (e) => {
            this._emit('handDrawn', e.target.checked)
        })

        for (const id of ['sv-pp-x', 'sv-pp-y', 'sv-pp-w', 'sv-pp-h']) {
            this.el.querySelector('#' + id).addEventListener('change', (e) => {
                const prop = { 'sv-pp-x': 'x', 'sv-pp-y': 'y', 'sv-pp-w': 'width', 'sv-pp-h': 'height' }[id]
                this._emit(prop, parseInt(e.target.value))
            })
        }
    }

    updateState(state) {
        this.state = { ...this.state, ...state }
        if (this.fillPicker) this.fillPicker.setValue(this.state.fill || 'transparent')
        if (this.strokePicker) this.strokePicker.setValue(this.state.stroke || '#000000')

        const setVal = (sel, val) => {
            const el = this.el.querySelector(sel)
            if (el) {
                if (el.tagName === 'SPAN') {
                    el.textContent = val
                } else {
                    el.value = val
                }
            }
        }
        setVal('#sv-pp-stroke-width', this.state.strokeWidth || 2)
        setVal('#sv-pp-stroke-width-val', (this.state.strokeWidth || 2) + 'px')
        setVal('#sv-pp-opacity', Math.round((this.state.opacity ?? 1) * 100))
        setVal('#sv-pp-opacity-val', Math.round((this.state.opacity ?? 1) * 100) + '%')
        setVal('#sv-pp-font-size', this.state.fontSize || 16)

        const hd = this.el.querySelector('#sv-pp-hand-drawn')
        if (hd) hd.checked = !!this.state.handDrawn

        setVal('#sv-pp-x', this.state.x || 0)
        setVal('#sv-pp-y', this.state.y || 0)
        setVal('#sv-pp-w', this.state.width || 0)
        setVal('#sv-pp-h', this.state.height || 0)
    }

    mount(parent) {
        if (!this.el) this.render()
        parent.appendChild(this.el)
        return this.el
    }
}
