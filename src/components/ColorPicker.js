const PRESET_COLORS = [
    '#000000', '#434343', '#666666', '#999999',
    '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef',
    '#f3f3f3', '#ffffff', '#980000', '#ff0000',
    '#ff9900', '#ffff00', '#00ff00', '#00ffff',
    '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc',
    '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3',
    '#d9d2e9', '#ead1dc'
]

export default class ColorPicker {
    constructor(options = {}) {
        this.label = options.label || 'Color'
        this.value = options.value || '#000000'
        this.opacity = options.opacity ?? 1
        this.onChange = options.onChange || (() => {})
        this.recentColors = []
        this.isOpen = false
        this.el = null
        this.paletteEl = null
    }

    render() {
        this.el = document.createElement('div')
        this.el.className = 'sv-color-picker'
        this.el.innerHTML = `
            <label class="sv-color-picker__label">${this.label}</label>
            <div class="sv-color-picker__trigger" tabindex="0" role="button" aria-label="Choose ${this.label}">
                <span class="sv-color-picker__swatch" style="background:${this.value}"></span>
                <input class="sv-color-picker__hex" type="text" value="${this.value}" maxlength="7" spellcheck="false" />
            </div>
            <div class="sv-color-picker__palette" style="display:none">
                <div class="sv-color-picker__swatches"></div>
                <div class="sv-color-picker__custom">
                    <label>Hex</label>
                    <input type="text" class="sv-color-picker__custom-input" value="${this.value}" maxlength="7" spellcheck="false" />
                    <input type="color" class="sv-color-picker__native" value="${this.value}" />
                </div>
                <div class="sv-color-picker__opacity">
                    <label>Opacity</label>
                    <input type="range" class="sv-color-picker__opacity-slider" min="0" max="100" value="${Math.round(this.opacity * 100)}" />
                    <span class="sv-color-picker__opacity-val">${Math.round(this.opacity * 100)}%</span>
                </div>
                <div class="sv-color-picker__recent">
                    <label>Recent</label>
                    <div class="sv-color-picker__recent-list"></div>
                </div>
                <button class="sv-color-picker__none" type="button">No Color</button>
            </div>
        `

        this._renderSwatches()
        this._renderRecent()
        this._bindEvents()
        return this.el
    }

    _renderSwatches() {
        const container = this.el.querySelector('.sv-color-picker__swatches')
        container.innerHTML = ''
        for (const color of PRESET_COLORS) {
            const swatch = document.createElement('span')
            swatch.className = 'sv-color-picker__preset'
            swatch.style.background = color
            swatch.dataset.color = color
            if (color === this.value) swatch.classList.add('sv-color-picker__preset--active')
            container.appendChild(swatch)
        }
    }

    _renderRecent() {
        const container = this.el.querySelector('.sv-color-picker__recent-list')
        container.innerHTML = ''
        for (const color of this.recentColors) {
            const swatch = document.createElement('span')
            swatch.className = 'sv-color-picker__recent-swatch'
            swatch.style.background = color
            swatch.dataset.color = color
            container.appendChild(swatch)
        }
    }

    _addRecent(color) {
        if (!color || color === 'transparent') return
        this.recentColors = this.recentColors.filter(c => c !== color)
        this.recentColors.unshift(color)
        if (this.recentColors.length > 8) this.recentColors.pop()
        this._renderRecent()
    }

    _bindEvents() {
        const trigger = this.el.querySelector('.sv-color-picker__trigger')
        const palette = this.el.querySelector('.sv-color-picker__palette')
        const hexInput = this.el.querySelector('.sv-color-picker__hex')
        const customInput = this.el.querySelector('.sv-color-picker__custom-input')
        const nativeInput = this.el.querySelector('.sv-color-picker__native')
        const opacitySlider = this.el.querySelector('.sv-color-picker__opacity-slider')
        const opacityVal = this.el.querySelector('.sv-color-picker__opacity-val')
        const noneBtn = this.el.querySelector('.sv-color-picker__none')

        trigger.addEventListener('click', () => {
            this.isOpen = !this.isOpen
            palette.style.display = this.isOpen ? 'block' : 'none'
        })

        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.el.contains(e.target)) {
                this.isOpen = false
                palette.style.display = 'none'
            }
        })

        this.el.addEventListener('click', (e) => {
            const preset = e.target.closest('.sv-color-picker__preset, .sv-color-picker__recent-swatch')
            if (preset) {
                this.setValue(preset.dataset.color)
            }
        })

        hexInput.addEventListener('change', () => {
            const v = hexInput.value.trim()
            if (/^#[0-9a-fA-F]{6}$/.test(v)) this.setValue(v)
            else hexInput.value = this.value
        })

        customInput.addEventListener('change', () => {
            const v = customInput.value.trim()
            if (/^#[0-9a-fA-F]{6}$/.test(v)) this.setValue(v)
            else customInput.value = this.value
        })

        nativeInput.addEventListener('input', () => {
            this.setValue(nativeInput.value)
        })

        opacitySlider.addEventListener('input', () => {
            this.opacity = parseInt(opacitySlider.value) / 100
            opacityVal.textContent = opacitySlider.value + '%'
            this.onChange(this.value, this.opacity)
        })

        noneBtn.addEventListener('click', () => {
            this.setValue('transparent')
        })
    }

    setValue(color) {
        this.value = color
        this._addRecent(color)
        const swatch = this.el.querySelector('.sv-color-picker__swatch')
        const hexInput = this.el.querySelector('.sv-color-picker__hex')
        const customInput = this.el.querySelector('.sv-color-picker__custom-input')
        const nativeInput = this.el.querySelector('.sv-color-picker__native')
        swatch.style.background = color
        hexInput.value = color
        customInput.value = color
        if (color !== 'transparent') nativeInput.value = color
        this.el.querySelectorAll('.sv-color-picker__preset').forEach(s => {
            s.classList.toggle('sv-color-picker__preset--active', s.dataset.color === color)
        })
        this.onChange(color, this.opacity)
    }

    getValue() {
        return this.value
    }

    mount(parent) {
        if (!this.el) this.render()
        parent.appendChild(this.el)
        return this.el
    }
}
