export default class EraserTool {
    constructor(tm) {
        this.tm = tm
        this.isErasing = false
        this.erasedIds = new Set()
        this.lastPos = null
        this.eraserRadius = 10
    }

    handleMouseDown(pos, e) {
        this.isErasing = true
        this.erasedIds = new Set()
        this.lastPos = pos
        this._eraseAt(pos)
    }

    handleMouseMove(pos, e) {
        if (!this.isErasing) return
        this._eraseAlongPath(this.lastPos, pos)
        this.lastPos = pos
        this.tm.redraw()
    }

    handleMouseUp(pos, e) {
        if (!this.isErasing) return
        this.isErasing = false
        if (this.erasedIds.size > 0) {
            this.tm.pushHistory()
            const s = this.tm.state.getState()
            this.tm.state.setState({
                shapes: s.shapes.filter(sh => !this.erasedIds.has(sh.id)),
                selectedIds: s.selectedIds.filter(id => !this.erasedIds.has(id))
            })
            this.tm.redraw()
        }
        this.erasedIds = new Set()
    }

    _eraseAt(pos) {
        const s = this.tm.state.getState()
        const r = this.eraserRadius / this.tm.viewport.zoomLevel
        for (const shape of s.shapes) {
            if (this.erasedIds.has(shape.id) || shape.locked) continue
            if (this._hitTest(shape, pos.x, pos.y, r)) {
                this.erasedIds.add(shape.id)
            }
        }
        if (this.erasedIds.size > 0) {
            this.tm.state.setState({ shapes: s.shapes.filter(sh => !this.erasedIds.has(sh.id)) })
        }
    }

    _eraseAlongPath(from, to) {
        const dx = to.x - from.x, dy = to.y - from.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const r = this.eraserRadius / this.tm.viewport.zoomLevel
        const steps = Math.max(1, Math.ceil(dist / (r / 2)))
        for (let i = 0; i <= steps; i++) {
            const t = i / steps
            const px = from.x + dx * t, py = from.y + dy * t
            const shapes = this.tm.state.getState().shapes
            for (const shape of shapes) {
                if (this.erasedIds.has(shape.id) || shape.locked) continue
                if (this._hitTest(shape, px, py, r)) {
                    this.erasedIds.add(shape.id)
                }
            }
        }
        if (this.erasedIds.size > 0) {
            const s = this.tm.state.getState()
            this.tm.state.setState({ shapes: s.shapes.filter(sh => !this.erasedIds.has(sh.id)) })
        }
    }

    _hitTest(shape, cx, cy, r) {
        switch (shape.type) {
            case 'rect': {
                const closestX = Math.max(shape.x, Math.min(cx, shape.x + (shape.width || 0)))
                const closestY = Math.max(shape.y, Math.min(cy, shape.y + (shape.height || 0)))
                const dx = cx - closestX, dy = cy - closestY
                return dx * dx + dy * dy <= r * r
            }
            case 'circle': {
                const dx = cx - shape.x, dy = cy - shape.y
                return Math.sqrt(dx * dx + dy * dy) <= (shape.radius || 20) + r
            }
            case 'line': case 'arrow':
                return this._lineHit(shape.startX, shape.startY, shape.endX, shape.endY, cx, cy, r)
            case 'path':
                if (!shape.points) return false
                for (let i = 0; i < shape.points.length - 1; i++) {
                    if (this._lineHit(shape.points[i].x, shape.points[i].y, shape.points[i + 1].x, shape.points[i + 1].y, cx, cy, r)) return true
                }
                return false
            case 'text': {
                const w = shape.width || 100, h = (shape.fontSize || 20) * 1.4
                return this._rectHit(shape.x, shape.y - h, w, h + 4, cx, cy, r)
            }
            default: return false
        }
    }

    _rectHit(rx, ry, rw, rh, cx, cy, r) {
        const closestX = Math.max(rx, Math.min(cx, rx + rw))
        const closestY = Math.max(ry, Math.min(cy, ry + rh))
        const dx = cx - closestX, dy = cy - closestY
        return dx * dx + dy * dy <= r * r
    }

    _lineHit(x1, y1, x2, y2, cx, cy, r) {
        const dx = x2 - x1, dy = y2 - y1
        const lenSq = dx * dx + dy * dy
        if (lenSq === 0) return Math.sqrt((cx - x1) ** 2 + (cy - y1) ** 2) <= r
        let t = ((cx - x1) * dx + (cy - y1) * dy) / lenSq
        t = Math.max(0, Math.min(1, t))
        const nx = x1 + t * dx, ny = y1 + t * dy
        return Math.sqrt((cx - nx) ** 2 + (cy - ny) ** 2) <= r
    }

    activate() { this.tm.canvas.style.cursor = 'crosshair' }
    deactivate() { this.isErasing = false; this.erasedIds = new Set() }
}
