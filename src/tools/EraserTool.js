export default class EraserTool {
    constructor(toolManager) {
        this.tm = toolManager
        this.isErasing = false
        this.erasedIds = new Set()
        this.eraserRadius = 10
        this.lastPos = null
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
    }

    handleMouseUp(pos, e) {
        if (!this.isErasing) return
        this.isErasing = false

        if (this.erasedIds.size > 0) {
            this.tm.pushHistory()
            const state = this.tm.state.getState()
            this.tm.state.setState({
                shapes: state.shapes.filter(s => !this.erasedIds.has(s.id)),
                selectedIds: state.selectedIds.filter(id => !this.erasedIds.has(id))
            })
        }

        this.erasedIds = new Set()
        this.lastPos = null
    }

    _eraseAt(pos) {
        const state = this.tm.state.getState()
        const r = this.eraserRadius / (this.tm.viewport ? this.tm.viewport.zoomLevel : 1)

        for (const shape of state.shapes) {
            if (this.erasedIds.has(shape.id)) continue
            if (shape.locked) continue

            if (this._shapeIntersectsCircle(shape, pos.x, pos.y, r)) {
                this.erasedIds.add(shape.id)
                this.tm.state.setState({
                    shapes: state.shapes.filter(s => s.id !== shape.id)
                })
            }
        }
    }

    _eraseAlongPath(from, to) {
        const state = this.tm.state.getState()
        const r = this.eraserRadius / (this.tm.viewport ? this.tm.viewport.zoomLevel : 1)

        const dx = to.x - from.x
        const dy = to.y - from.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const steps = Math.max(1, Math.ceil(dist / (r / 2)))

        for (let i = 0; i <= steps; i++) {
            const t = i / steps
            const px = from.x + dx * t
            const py = from.y + dy * t

            const currentShapes = this.tm.state.getState().shapes
            for (const shape of currentShapes) {
                if (this.erasedIds.has(shape.id)) continue
                if (shape.locked) continue

                if (this._shapeIntersectsCircle(shape, px, py, r)) {
                    this.erasedIds.add(shape.id)
                    this.tm.state.setState({
                        shapes: currentShapes.filter(s => s.id !== shape.id)
                    })
                }
            }
        }
    }

    _shapeIntersectsCircle(shape, cx, cy, r) {
        switch (shape.type) {
            case 'rect':
                return this._rectIntersectsCircle(shape.x, shape.y, shape.width, shape.height, cx, cy, r)
            case 'circle': {
                const dx = cx - shape.x
                const dy = cy - shape.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                return dist <= shape.radius + r
            }
            case 'line':
            case 'arrow':
                return this._lineIntersectsCircle(shape.startX, shape.startY, shape.endX, shape.endY, cx, cy, r)
            case 'path':
                return this._pathIntersectsCircle(shape.points, cx, cy, r)
            case 'text': {
                const w = shape.width || 200
                const h = (shape.fontSize || 16) * 1.4
                return this._rectIntersectsCircle(shape.x, shape.y - h, w, h + 4, cx, cy, r)
            }
            default:
                return false
        }
    }

    _rectIntersectsCircle(rx, ry, rw, rh, cx, cy, r) {
        const closestX = Math.max(rx, Math.min(cx, rx + rw))
        const closestY = Math.max(ry, Math.min(cy, ry + rh))
        const dx = cx - closestX
        const dy = cy - closestY
        return (dx * dx + dy * dy) <= (r * r)
    }

    _lineIntersectsCircle(x1, y1, x2, y2, cx, cy, r) {
        const dx = x2 - x1
        const dy = y2 - y1
        const lenSq = dx * dx + dy * dy

        if (lenSq === 0) {
            const d = Math.sqrt((cx - x1) ** 2 + (cy - y1) ** 2)
            return d <= r
        }

        let t = ((cx - x1) * dx + (cy - y1) * dy) / lenSq
        t = Math.max(0, Math.min(1, t))

        const nearX = x1 + t * dx
        const nearY = y1 + t * dy
        const dist = Math.sqrt((cx - nearX) ** 2 + (cy - nearY) ** 2)

        return dist <= r
    }

    _pathIntersectsCircle(points, cx, cy, r) {
        if (!points || points.length < 2) return false

        for (let i = 0; i < points.length - 1; i++) {
            if (this._lineIntersectsCircle(
                points[i].x, points[i].y,
                points[i + 1].x, points[i + 1].y,
                cx, cy, r
            )) {
                return true
            }
        }
        return false
    }

    activate() {
        if (this.tm.canvas) this.tm.canvas.style.cursor = 'crosshair'
    }

    deactivate() {
        this.isErasing = false
        this.erasedIds = new Set()
        this.lastPos = null
    }
}
