export default class TextTool {
    constructor(tm) {
        this.tm = tm
        this.isDrawing = false
        this.startPos = null
        this.preview = null
        this.editingShape = null
        this.inputEl = null
    }

    handleMouseDown(pos, e) {
        if (this.editingShape) { this._finalizeEdit(); return }

        const s = this.tm.state.getState()
        const existing = this._findTextAt(pos.x, pos.y, s.shapes)
        if (existing) { this._startEditing(existing); return }

        this.startPos = { x: pos.x, y: pos.y }
        this.preview = {
            type: 'text',
            id: 's_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            x: pos.x, y: pos.y, width: 0, height: 0,
            text: '',
            fontSize: s.fontSize || 20,
            fontFamily: s.fontFamily || "'Excalifont', Arial, sans-serif",
            textAlign: s.textAlign || 'left',
            stroke: s.stroke || '#1e1e1e',
            fill: 'transparent',
            strokeWidth: 0,
            opacity: s.opacity !== undefined ? s.opacity : 1,
        }
        this.isDrawing = true
    }

    handleMouseMove(pos, e) {
        if (!this.isDrawing || !this.preview) return
        const p = this.preview
        p.x = Math.min(this.startPos.x, pos.x)
        p.y = Math.min(this.startPos.y, pos.y)
        p.width = Math.abs(pos.x - this.startPos.x)
        p.height = Math.abs(pos.y - this.startPos.y)
        this.tm.redraw()
    }

    handleMouseUp(pos, e) {
        if (!this.isDrawing || !this.preview) return
        this.isDrawing = false
        const p = this.preview

        if (p.width < 10 && p.height < 10) {
            p.width = 150
            p.height = (p.fontSize || 20) * 1.4
            p.x = this.startPos.x
            p.y = this.startPos.y
        }

        this.tm.pushHistory()
        const s = this.tm.state.getState()
        this.tm.state.setState({ shapes: [...s.shapes, p] })
        this.preview = null
        this.tm.redraw()
        this._startEditing(p)
    }

    _startEditing(shape) {
        this._removeInput()
        this.editingShape = shape
        const vp = this.tm.viewport
        const sp = vp.worldToScreen(shape.x, shape.y)
        const zoom = vp.zoomLevel

        const ta = document.createElement('textarea')
        ta.className = 'text-input-overlay'
        ta.value = shape.text || ''
        ta.style.left = sp.x + 'px'
        ta.style.top = sp.y + 'px'
        ta.style.width = Math.max((shape.width || 150) * zoom, 60) + 'px'
        ta.style.minHeight = Math.max((shape.height || 30) * zoom, 30) + 'px'
        ta.style.fontSize = (shape.fontSize || 20) * zoom + 'px'
        ta.style.fontFamily = shape.fontFamily || 'Arial'
        ta.style.color = shape.stroke || '#1e1e1e'
        ta.style.textAlign = shape.textAlign || 'left'

        ta.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this._finalizeEdit()
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._finalizeEdit() }
            e.stopPropagation()
        })
        ta.addEventListener('blur', () => { setTimeout(() => this._finalizeEdit(), 100) })
        ta.addEventListener('input', () => {
            ta.style.height = 'auto'
            ta.style.height = ta.scrollHeight + 'px'
        })

        document.getElementById('text-input-container').appendChild(ta)
        this.inputEl = ta
        ta.focus()
        ta.style.height = 'auto'
        ta.style.height = ta.scrollHeight + 'px'
    }

    _finalizeEdit() {
        if (!this.editingShape || !this.inputEl) return
        const text = this.inputEl.value
        const s = this.tm.state.getState()

        this.tm.pushHistory()
        const ctx = this.tm.getCtx()
        let width = this.editingShape.width || 150
        if (ctx && text) {
            ctx.font = `${this.editingShape.fontSize || 20}px ${this.editingShape.fontFamily || 'Arial'}`
            width = Math.max(ctx.measureText(text).width + 10, 50)
        }

        if (!text.trim()) {
            this.tm.state.setState({ shapes: s.shapes.filter(sh => sh.id !== this.editingShape.id) })
        } else {
            this.tm.state.setState({
                shapes: s.shapes.map(sh => sh.id === this.editingShape.id ? { ...sh, text, width } : sh)
            })
        }

        this._removeInput()
        this.editingShape = null
        this.tm.redraw()
    }

    _findTextAt(x, y, shapes) {
        for (let i = shapes.length - 1; i >= 0; i--) {
            const s = shapes[i]
            if (s.type === 'text') {
                const w = s.width || 100, h = (s.fontSize || 20) * 1.4
                if (x >= s.x && x <= s.x + w && y >= s.y && y <= s.y + h) return s
            }
        }
        return null
    }

    _removeInput() {
        if (this.inputEl?.parentNode) this.inputEl.parentNode.removeChild(this.inputEl)
        this.inputEl = null
    }

    handleKeyDown(e) {
        if (this.editingShape && e.key === 'Escape') this._finalizeEdit()
    }

    activate() { this.tm.canvas.style.cursor = 'crosshair' }
    deactivate() { if (this.editingShape) this._finalizeEdit(); this._removeInput(); this.isDrawing = false; this.preview = null }
}
