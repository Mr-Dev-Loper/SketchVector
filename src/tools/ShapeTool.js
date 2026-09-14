export default class ShapeTool {
    constructor(toolManager, shapeType) {
        this.tm = toolManager
        this.shapeType = shapeType
        this.isDrawing = false
        this.startPos = null
        this.previewShape = null
        this.shiftHeld = false
    }

    handleMouseDown(pos, e) {
        this.startPos = { x: pos.x, y: pos.y }
        this.shiftHeld = e.shiftKey
        this.isDrawing = true

        const state = this.tm.state.getState()
        this.previewShape = {
            type: this.shapeType === 'diamond' ? 'rect' : this.shapeType,
            id: this._generateId(),
            startX: pos.x,
            startY: pos.y,
            endX: pos.x,
            endY: pos.y,
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
            radius: 0,
            stroke: state.colors.stroke,
            fill: state.colors.fill,
            strokeWidth: state.strokeWidth,
            opacity: state.opacity,
            handDrawn: state.handDrawn,
            isDiamond: this.shapeType === 'diamond'
        }
    }

    handleMouseMove(pos, e) {
        if (!this.isDrawing || !this.previewShape) return

        this.shiftHeld = e.shiftKey
        this.previewShape.endX = pos.x
        this.previewShape.endY = pos.y
        this._updateShapeDimensions()

        this.tm.redraw()
    }

    handleMouseUp(pos, e) {
        if (!this.isDrawing || !this.previewShape) return
        this.isDrawing = false

        this.previewShape.endX = pos.x
        this.previewShape.endY = pos.y
        this._updateShapeDimensions()

        const s = this.previewShape
        const valid = this._isValidShape(s)

        if (valid) {
            this.tm.pushHistory()
            const state = this.tm.state.getState()
            this.tm.state.setState({
                shapes: [...state.shapes, s]
            })
        }

        this.previewShape = null
        this.startPos = null
        this.tm.redraw()
    }

    _updateShapeDimensions() {
        const s = this.previewShape
        const tool = this.shapeType

        switch (tool) {
            case 'rect':
            case 'diamond':
                s.x = Math.min(s.startX, s.endX)
                s.y = Math.min(s.startY, s.endY)
                s.width = Math.abs(s.endX - s.startX)
                s.height = Math.abs(s.endY - s.startY)
                if (this.shiftHeld) {
                    const size = Math.max(s.width, s.height)
                    s.width = size
                    s.height = size
                }
                break
            case 'circle': {
                const dx = s.endX - s.startX
                const dy = s.endY - s.startY
                s.radius = Math.sqrt(dx * dx + dy * dy)
                s.x = s.startX
                s.y = s.startY
                if (this.shiftHeld) {
                    s.radius = Math.abs(dx)
                }
                break
            }
            case 'line':
            case 'arrow':
                if (this.shiftHeld) {
                    const dx = s.endX - s.startX
                    const dy = s.endY - s.startY
                    const angle = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4)
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    s.endX = s.startX + Math.cos(angle) * dist
                    s.endY = s.startY + Math.sin(angle) * dist
                }
                break
        }
    }

    _isValidShape(s) {
        switch (this.shapeType) {
            case 'rect':
            case 'diamond':
                return Math.abs(s.width) > 2 || Math.abs(s.height) > 2
            case 'circle':
                return s.radius > 2
            case 'line':
            case 'arrow': {
                const dx = s.endX - s.startX
                const dy = s.endY - s.startY
                return Math.sqrt(dx * dx + dy * dy) > 2
            }
            default:
                return false
        }
    }

    _generateId() {
        return 'shape_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    }

    activate() {
        if (this.tm.canvas) this.tm.canvas.style.cursor = 'crosshair'
    }

    deactivate() {
        if (this.isDrawing) {
            this.isDrawing = false
            this.previewShape = null
            this.startPos = null
        }
    }
}
