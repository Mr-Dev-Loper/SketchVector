export default class TextTool {
    constructor(toolManager) {
        this.tm = toolManager
        this.editingText = null
        this.inputEl = null
    }

    handleMouseDown(pos, e) {
        const state = this.tm.state.getState()

        const existing = this._findTextAt(pos.x, pos.y, state.shapes)
        if (existing) {
            this._startEditing(existing)
            return
        }

        this._createNewText(pos, state)
    }

    handleKeyDown(e) {
        if (!this.editingText) return

        if (e.key === 'Escape') {
            this._cancelEdit()
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            this._finalizeEdit()
        }
    }

    _createNewText(pos, state) {
        const textShape = {
            type: 'text',
            id: this._generateId(),
            x: pos.x,
            y: pos.y,
            text: '',
            fontSize: state.fontSize || 16,
            fontFamily: state.fontFamily || 'Arial',
            stroke: state.colors.stroke,
            fill: state.colors.fill,
            strokeWidth: 0,
            opacity: state.opacity,
            width: 200,
            height: (state.fontSize || 16) * 1.4
        }

        this.tm.pushHistory()
        this.tm.state.setState({
            shapes: [...state.shapes, textShape]
        })

        this._startEditing(textShape)
    }

    _startEditing(textShape) {
        this._removeInput()
        this.editingText = textShape

        const vp = this.tm.viewport
        const screenPos = vp ? vp.worldToScreen(textShape.x, textShape.y) : { x: textShape.x, y: textShape.y }
        const zoom = vp ? vp.zoom : 1

        const input = document.createElement('textarea')
        input.className = 'text-tool-input'
        input.value = textShape.text || ''
        input.style.cssText = `
            position: fixed;
            left: ${screenPos.x}px;
            top: ${screenPos.y - (textShape.fontSize || 16) * zoom}px;
            font-size: ${(textShape.fontSize || 16) * zoom}px;
            font-family: ${textShape.fontFamily || 'Arial'};
            color: ${textShape.stroke || '#000'};
            background: transparent;
            border: 1px dashed #4a86e8;
            outline: none;
            resize: none;
            min-width: 100px;
            min-height: ${(textShape.fontSize || 16) * zoom * 1.5}px;
            padding: 2px 4px;
            z-index: 10000;
            line-height: 1.4;
            overflow: hidden;
        `

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this._cancelEdit()
            } else if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                this._finalizeEdit()
            }
            e.stopPropagation()
        })

        input.addEventListener('input', () => {
            this._autoResizeInput(input)
        })

        document.body.appendChild(input)
        this.inputEl = input
        input.focus()
        input.select()
        this._autoResizeInput(input)
    }

    _autoResizeInput(input) {
        input.style.height = 'auto'
        input.style.height = input.scrollHeight + 'px'
    }

    _finalizeEdit() {
        if (!this.editingText || !this.inputEl) return

        const text = this.inputEl.value.trim()
        if (!text) {
            this._removeText(this.editingText.id)
        } else {
            this._updateTextContent(this.editingText, text)
        }

        this._removeInput()
        this.editingText = null
    }

    _cancelEdit() {
        if (this.editingText && !this.editingText.text) {
            this._removeText(this.editingText.id)
        }
        this._removeInput()
        this.editingText = null
    }

    _updateTextContent(textShape, content) {
        const state = this.tm.state.getState()
        this.tm.pushHistory()

        const ctx = this.tm.getCtx()
        if (ctx) {
            ctx.font = `${textShape.fontSize || 16}px ${textShape.fontFamily || 'Arial'}`
            textShape.width = Math.max(ctx.measureText(content).width + 10, 50)
        }

        const shapes = state.shapes.map(s => {
            if (s.id === textShape.id) {
                return { ...s, text: content, width: textShape.width }
            }
            return s
        })
        this.tm.state.setState({ shapes })
    }

    _removeText(id) {
        const state = this.tm.state.getState()
        this.tm.pushHistory()
        this.tm.state.setState({
            shapes: state.shapes.filter(s => s.id !== id)
        })
    }

    _findTextAt(x, y, shapes) {
        for (let i = shapes.length - 1; i >= 0; i--) {
            const s = shapes[i]
            if (s.type === 'text') {
                const w = s.width || 200
                const h = (s.fontSize || 16) * 1.4
                if (x >= s.x && x <= s.x + w && y >= s.y - h && y <= s.y + 4) {
                    return s
                }
            }
        }
        return null
    }

    _removeInput() {
        if (this.inputEl && this.inputEl.parentNode) {
            this.inputEl.parentNode.removeChild(this.inputEl)
        }
        this.inputEl = null
    }

    _generateId() {
        return 'shape_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    }

    activate() {
        if (this.tm.canvas) this.tm.canvas.style.cursor = 'text'
    }

    deactivate() {
        if (this.editingText) {
            this._finalizeEdit()
        }
        this._removeInput()
        this.editingText = null
    }
}
