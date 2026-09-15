export default class PenTool {
    constructor(tm) {
        this.tm = tm
        this.isDrawing = false
        this.currentPath = null
    }

    handleMouseDown(pos, e) {
        const s = this.tm.state.getState()
        this.currentPath = {
            type: 'path',
            id: 's_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            points: [{ x: pos.x, y: pos.y }],
            stroke: s.stroke || '#1e1e1e',
            fill: 'transparent',
            strokeWidth: s.strokeWidth || 2,
            opacity: s.opacity !== undefined ? s.opacity : 1,
        }
        this.isDrawing = true
    }

    handleMouseMove(pos, e) {
        if (!this.isDrawing || !this.currentPath) return
        const pts = this.currentPath.points
        const last = pts[pts.length - 1]
        const dx = pos.x - last.x
        const dy = pos.y - last.y
        if (dx * dx + dy * dy < 4) return
        this.currentPath.points.push({ x: pos.x, y: pos.y })
        this.tm.redraw()
    }

    handleMouseUp(pos, e) {
        if (!this.isDrawing || !this.currentPath) return
        this.isDrawing = false
        if (this.currentPath.points.length >= 2) {
            this.tm.pushHistory()
            const s = this.tm.state.getState()
            this.tm.state.setState({ shapes: [...s.shapes, this.currentPath] })
        }
        this.currentPath = null
        this.tm.redraw()
    }

    activate() { this.tm.canvas.style.cursor = 'crosshair' }
    deactivate() { this.isDrawing = false; this.currentPath = null }
}
