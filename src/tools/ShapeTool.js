export default class ShapeTool {
    constructor(tm, shapeType) {
        this.tm = tm
        this.shapeType = shapeType
        this.isDrawing = false
        this.startPos = null
        this.preview = null
    }

    handleMouseDown(pos, e) {
        this.startPos = { x: pos.x, y: pos.y }
        const s = this.tm.state.getState()
        this.preview = {
            type: this.shapeType === 'diamond' ? 'rect' : this.shapeType,
            id: 's_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            x: pos.x, y: pos.y, width: 0, height: 0,
            radius: 0,
            startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y,
            stroke: s.stroke || '#1e1e1e',
            fill: s.fill || 'transparent',
            strokeWidth: s.strokeWidth || 2,
            strokeStyle: s.strokeStyle || 'solid',
            opacity: s.opacity !== undefined ? s.opacity : 1,
            edges: s.edges || 'sharp',
            isDiamond: this.shapeType === 'diamond',
        }
        this.isDrawing = true
    }

    handleMouseMove(pos, e) {
        if (!this.isDrawing || !this.preview) return
        const p = this.preview
        p.endX = pos.x
        p.endY = pos.y

        if (this.shapeType === 'rect' || this.shapeType === 'diamond') {
            p.x = Math.min(p.startX, p.endX)
            p.y = Math.min(p.startY, p.endY)
            p.width = Math.abs(p.endX - p.startX)
            p.height = Math.abs(p.endY - p.startY)
            if (e.shiftKey) { const sz = Math.max(p.width, p.height); p.width = sz; p.height = sz }
        } else if (this.shapeType === 'circle') {
            const dx = p.endX - p.startX
            const dy = p.endY - p.startY
            p.radius = Math.sqrt(dx * dx + dy * dy)
            p.x = p.startX
            p.y = p.startY
        }
        this.tm.redraw()
    }

    handleMouseUp(pos, e) {
        if (!this.isDrawing || !this.preview) return
        this.isDrawing = false
        const p = this.preview

        let valid = false
        if (this.shapeType === 'rect' || this.shapeType === 'diamond') valid = p.width > 2 || p.height > 2
        else if (this.shapeType === 'circle') valid = p.radius > 2
        else {
            const dx = p.endX - p.startX, dy = p.endY - p.startY
            valid = Math.sqrt(dx * dx + dy * dy) > 2
        }

        if (valid) {
            this.tm.pushHistory()
            const s = this.tm.state.getState()
            this.tm.state.setState({ shapes: [...s.shapes, p] })
        }
        this.preview = null
        this.tm.redraw()
    }

    activate() { this.tm.canvas.style.cursor = 'crosshair' }
    deactivate() { this.isDrawing = false; this.preview = null }
}
