export default class SelectionTool {
    constructor(tm) {
        this.tm = tm
        this.mode = 'idle'
        this.dragStart = null
        this.dragShapeIds = null
        this.marquee = null
        this.origShapes = null
        this.resizeHandle = null
        this.resizeShape = null
        this.resizeStart = null
    }

    handleMouseDown(pos, e) {
        const s = this.tm.state.getState()
        this.origShapes = JSON.parse(JSON.stringify(s.shapes))

        if (s.selectedIds.length === 1) {
            const shape = s.shapes.find(sh => sh.id === s.selectedIds[0])
            if (shape) {
                const handle = this._hitHandle(pos.x, pos.y, shape)
                if (handle) {
                    this.mode = 'resizing'
                    this.resizeHandle = handle
                    this.resizeShape = shape
                    this.resizeStart = { x: pos.x, y: pos.y }
                    this.tm.redraw()
                    return
                }
            }
        }

        const hit = this._findAt(pos.x, pos.y, s)
        if (hit) {
            if (e.shiftKey) {
                const ids = s.selectedIds.includes(hit.id)
                    ? s.selectedIds.filter(id => id !== hit.id)
                    : [...s.selectedIds, hit.id]
                this.tm.state.setState({ selectedIds: ids })
            } else {
                if (!s.selectedIds.includes(hit.id)) this.tm.state.setState({ selectedIds: [hit.id] })
            }
            this.mode = 'dragging'
            this.dragStart = { x: pos.x, y: pos.y }
            this.dragShapeIds = [...this.tm.state.getState().selectedIds]
        } else {
            this.tm.state.setState({ selectedIds: [] })
            this.mode = 'marquee'
            this.dragStart = { x: pos.x, y: pos.y }
        }
    }

    handleMouseMove(pos, e) {
        if (this.mode === 'resizing' && this.resizeShape && this.resizeHandle) {
            const dx = pos.x - this.resizeStart.x
            const dy = pos.y - this.resizeStart.y
            const shape = this.resizeShape
            const h = this.resizeHandle
            const s = this.tm.state.getState()

            this.tm.state.setState({
                shapes: s.shapes.map(sh => {
                    if (sh.id !== shape.id) return sh
                    return this._resize(sh, h, dx, dy)
                })
            })
            this.resizeStart = { x: pos.x, y: pos.y }
            this.tm.redraw()
        } else if (this.mode === 'dragging' && this.dragShapeIds) {
            const dx = pos.x - this.dragStart.x, dy = pos.y - this.dragStart.y
            const s = this.tm.state.getState()
            this.tm.state.setState({
                shapes: s.shapes.map(sh => this.dragShapeIds.includes(sh.id) ? this._move(sh, dx, dy) : sh)
            })
            this.dragStart = { x: pos.x, y: pos.y }
            this.tm.redraw()
        } else if (this.mode === 'marquee') {
            this.marquee = {
                x: Math.min(this.dragStart.x, pos.x),
                y: Math.min(this.dragStart.y, pos.y),
                w: Math.abs(pos.x - this.dragStart.x),
                h: Math.abs(pos.y - this.dragStart.y)
            }
            this.tm.redraw()
        }
    }

    handleMouseUp(pos, e) {
        if (this.mode === 'resizing') {
            const curr = this.tm.state.getState().shapes
            const changed = JSON.stringify(curr) !== JSON.stringify(this.origShapes)
            if (changed) this.tm.pushHistory()
        } else if (this.mode === 'dragging') {
            const curr = this.tm.state.getState().shapes
            const changed = JSON.stringify(curr) !== JSON.stringify(this.origShapes)
            if (changed) this.tm.pushHistory()
        } else if (this.mode === 'marquee' && this.marquee) {
            const s = this.tm.state.getState()
            const selected = []
            for (const sh of s.shapes) {
                if (sh.visible === false || sh.locked) continue
                const b = this._bounds(sh)
                if (b && this._overlap(this.marquee, b)) selected.push(sh.id)
            }
            if (e.shiftKey) {
                const ids = new Set(s.selectedIds)
                selected.forEach(id => ids.has(id) ? ids.delete(id) : ids.add(id))
                this.tm.state.setState({ selectedIds: [...ids] })
            } else {
                this.tm.state.setState({ selectedIds: selected })
            }
            this.marquee = null
        }
        this.mode = 'idle'
        this.dragStart = null
        this.resizeHandle = null
        this.resizeShape = null
        this.tm.redraw()
    }

    handleKeyDown(e) {
        const s = this.tm.state.getState()
        if ((e.key === 'Delete' || e.key === 'Backspace') && s.selectedIds.length) {
            e.preventDefault()
            this.tm.pushHistory()
            this.tm.state.setState({ shapes: s.shapes.filter(sh => !s.selectedIds.includes(sh.id)), selectedIds: [] })
            this.tm.redraw()
        }
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && s.selectedIds.length) {
            e.preventDefault()
            const amt = e.shiftKey ? 10 : 1
            this.tm.pushHistory()
            this.tm.state.setState({
                shapes: s.shapes.map(sh => {
                    if (!s.selectedIds.includes(sh.id)) return sh
                    return this._move(sh, e.key === 'ArrowRight' ? amt : e.key === 'ArrowLeft' ? -amt : 0, e.key === 'ArrowDown' ? amt : e.key === 'ArrowUp' ? -amt : 0)
                })
            })
            this.tm.redraw()
        }
    }

    _resize(shape, handle, dx, dy) {
        const s = { ...shape }
        if (s.type === 'rect') {
            if (handle === 'se') { s.width = Math.max(10, (s.width || 0) + dx); s.height = Math.max(10, (s.height || 0) + dy) }
            else if (handle === 'sw') { s.x += dx; s.width = Math.max(10, (s.width || 0) - dx); s.height = Math.max(10, (s.height || 0) + dy) }
            else if (handle === 'ne') { s.width = Math.max(10, (s.width || 0) + dx); s.y += dy; s.height = Math.max(10, (s.height || 0) - dy) }
            else if (handle === 'nw') { s.x += dx; s.width = Math.max(10, (s.width || 0) - dx); s.y += dy; s.height = Math.max(10, (s.height || 0) - dy) }
            else if (handle === 'n') { s.y += dy; s.height = Math.max(10, (s.height || 0) - dy) }
            else if (handle === 's') { s.height = Math.max(10, (s.height || 0) + dy) }
            else if (handle === 'e') { s.width = Math.max(10, (s.width || 0) + dx) }
            else if (handle === 'w') { s.x += dx; s.width = Math.max(10, (s.width || 0) - dx) }
        } else if (s.type === 'circle') {
            const r = Math.max(5, (s.radius || 20) + (dx + dy) / 2)
            s.radius = r
        } else if (s.type === 'text') {
            if (handle === 'se') { s.width = Math.max(30, (s.width || 100) + dx); s.height = Math.max(20, (s.height || 30) + dy) }
            else if (handle === 'e') { s.width = Math.max(30, (s.width || 100) + dx) }
            else if (handle === 's') { s.height = Math.max(20, (s.height || 30) + dy) }
        } else if (s.type === 'line' || s.type === 'arrow') {
            if (handle === 'start') { s.startX += dx; s.startY += dy }
            else if (handle === 'end') { s.endX += dx; s.endY += dy }
        }
        return s
    }

    _hitHandle(x, y, shape) {
        const vp = this.tm.viewport
        const m = 8 / vp.zoomLevel
        const handles = this._getHandles(shape)
        for (const h of handles) {
            if (Math.abs(x - h.x) < m && Math.abs(y - h.y) < m) return h.name
        }
        return null
    }

    _getHandles(shape) {
        const vp = this.tm.viewport
        const s = 7 / vp.zoomLevel
        const handles = []

        if (shape.type === 'rect' || shape.type === 'text') {
            const x = shape.x, y = shape.y
            const w = shape.width || 100, h = (shape.height || shape.fontSize * 1.4 || 30)
            handles.push({ name: 'nw', x, y }, { name: 'ne', x: x + w, y }, { name: 'sw', x, y: y + h }, { name: 'se', x: x + w, y: y + h })
            handles.push({ name: 'n', x: x + w / 2, y }, { name: 's', x: x + w / 2, y: y + h }, { name: 'e', x: x + w, y: y + h / 2 }, { name: 'w', x, y: y + h / 2 })
        } else if (shape.type === 'circle') {
            const r = shape.radius || 20
            handles.push({ name: 'n', x: shape.x, y: shape.y - r }, { name: 's', x: shape.x, y: shape.y + r }, { name: 'e', x: shape.x + r, y: shape.y }, { name: 'w', x: shape.x - r, y: shape.y })
        } else if (shape.type === 'line' || shape.type === 'arrow') {
            handles.push({ name: 'start', x: shape.startX, y: shape.startY }, { name: 'end', x: shape.endX, y: shape.endY })
        }
        return handles
    }

    _drawResizeHandles(shape) {
        const ctx = this.tm.getCtx()
        const vp = this.tm.viewport
        const s = 5 / vp.zoomLevel
        const handles = this._getHandles(shape)
        ctx.save()
        ctx.fillStyle = 'white'
        ctx.strokeStyle = '#6c5ce7'
        ctx.lineWidth = 1.5 / vp.zoomLevel
        for (const h of handles) {
            ctx.beginPath()
            ctx.rect(h.x - s, h.y - s, s * 2, s * 2)
            ctx.fill()
            ctx.stroke()
        }
        ctx.restore()
    }

    _findAt(x, y, state) {
        for (let i = state.shapes.length - 1; i >= 0; i--) {
            const s = state.shapes[i]
            if (s.visible === false || s.locked) continue
            if (this._hit(s, x, y)) return s
        }
        return null
    }

    _hit(s, x, y) {
        const m = 8 / this.tm.viewport.zoomLevel
        switch (s.type) {
            case 'rect':
                if (s.isDiamond) {
                    const cx = s.x + (s.width || 0) / 2, cy = s.y + (s.height || 0) / 2
                    const dx = Math.abs(x - cx) / ((s.width || 0) / 2 + m)
                    const dy = Math.abs(y - cy) / ((s.height || 0) / 2 + m)
                    return dx + dy <= 1.2
                }
                return x >= s.x - m && x <= s.x + (s.width || 0) + m && y >= s.y - m && y <= s.y + (s.height || 0) + m
            case 'circle':
                return Math.sqrt((x - s.x) ** 2 + (y - s.y) ** 2) <= (s.radius || 20) + m
            case 'line': case 'arrow':
                return this._lineNear(x, y, s.startX, s.startY, s.endX, s.endY, m)
            case 'path':
                if (!s.points) return false
                for (let i = 0; i < s.points.length - 1; i++) {
                    if (this._lineNear(x, y, s.points[i].x, s.points[i].y, s.points[i + 1].x, s.points[i + 1].y, m)) return true
                }
                return false
            case 'text': {
                const w = s.width || 100, h = (s.height || (s.fontSize || 20) * 1.4)
                return x >= s.x - m && x <= s.x + w + m && y >= s.y - m && y <= s.y + h + m
            }
            default: return false
        }
    }

    _lineNear(px, py, x1, y1, x2, y2, margin) {
        const dx = x2 - x1, dy = y2 - y1
        const lenSq = dx * dx + dy * dy
        if (lenSq === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2) < margin
        let t = ((px - x1) * dx + (py - y1) * dy) / lenSq
        t = Math.max(0, Math.min(1, t))
        return Math.sqrt((px - (x1 + t * dx)) ** 2 + (py - (y1 + t * dy)) ** 2) < margin
    }

    _move(s, dx, dy) {
        const n = { ...s }
        if (n.points) n.points = n.points.map(p => ({ x: p.x + dx, y: p.y + dy }))
        if (n.type === 'line' || n.type === 'arrow') { n.startX += dx; n.startY += dy; n.endX += dx; n.endY += dy }
        else { n.x = (n.x || 0) + dx; n.y = (n.y || 0) + dy }
        return n
    }

    _bounds(s) {
        const m = 6
        switch (s.type) {
            case 'rect': return { x: s.x - m, y: s.y - m, w: (s.width || 0) + m * 2, h: (s.height || 0) + m * 2 }
            case 'circle': return { x: s.x - (s.radius || 20) - m, y: s.y - (s.radius || 20) - m, w: (s.radius || 20) * 2 + m * 2, h: (s.radius || 20) * 2 + m * 2 }
            case 'line': case 'arrow': {
                const x = Math.min(s.startX, s.endX), y = Math.min(s.startY, s.endY)
                return { x: x - m, y: y - m, w: Math.abs(s.endX - s.startX) + m * 2, h: Math.abs(s.endY - s.startY) + m * 2 }
            }
            case 'path': {
                if (!s.points?.length) return null
                let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity
                for (const p of s.points) { x1 = Math.min(x1, p.x); y1 = Math.min(y1, p.y); x2 = Math.max(x2, p.x); y2 = Math.max(y2, p.y) }
                return { x: x1 - m, y: y1 - m, w: x2 - x1 + m * 2, h: y2 - y1 + m * 2 }
            }
            case 'text': return { x: s.x - m, y: s.y - m, w: (s.width || 100) + m * 2, h: (s.height || (s.fontSize || 20) * 1.4) + m * 2 }
            default: return null
        }
    }

    _overlap(a, b) {
        return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y)
    }

    activate() { this.tm.canvas.style.cursor = 'default' }
    deactivate() { this.mode = 'idle'; this.marquee = null; this.resizeHandle = null }
}
