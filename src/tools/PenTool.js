export default class PenTool {
    constructor(toolManager) {
        this.tm = toolManager
        this.isDrawing = false
        this.currentPath = null
        this.lastPoint = null
    }

    handleMouseDown(pos, e) {
        const state = this.tm.state.getState()
        this.currentPath = {
            type: 'path',
            id: this._generateId(),
            points: [{ x: pos.x, y: pos.y }],
            stroke: state.colors.stroke,
            fill: 'transparent',
            strokeWidth: state.strokeWidth,
            opacity: state.opacity,
            handDrawn: state.handDrawn
        }
        this.lastPoint = pos
        this.isDrawing = true
    }

    handleMouseMove(pos, e) {
        if (!this.isDrawing || !this.currentPath) return

        const dx = pos.x - this.lastPoint.x
        const dy = pos.y - this.lastPoint.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 2 / (this.tm.viewport ? this.tm.viewport.zoom : 1)) return

        const pressure = e.pressure !== undefined && e.pressure > 0 ? e.pressure : 0.5
        this.currentPath.points.push({ x: pos.x, y: pos.y })
        this.currentPath._lastPressure = pressure
        this.lastPoint = pos

        this.tm.redraw()
    }

    handleMouseUp(pos, e) {
        if (!this.isDrawing || !this.currentPath) return
        this.isDrawing = false

        if (this.currentPath.points.length >= 2) {
            this.currentPath.points = this._simplifyPoints(this.currentPath.points, 1.5)
            this.tm.pushHistory()
            const state = this.tm.state.getState()
            this.tm.state.setState({
                shapes: [...state.shapes, this.currentPath]
            })
        }

        this.currentPath = null
        this.lastPoint = null
        this.tm.redraw()
    }

    _simplifyPoints(points, tolerance) {
        if (points.length <= 2) return points
        const simplified = [points[0]]
        for (let i = 1; i < points.length - 1; i++) {
            const prev = simplified[simplified.length - 1]
            const curr = points[i]
            const dx = curr.x - prev.x
            const dy = curr.y - prev.y
            if (Math.sqrt(dx * dx + dy * dy) >= tolerance) {
                simplified.push(curr)
            }
        }
        simplified.push(points[points.length - 1])
        return simplified
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
            this.currentPath = null
            this.lastPoint = null
        }
    }
}
