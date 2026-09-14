export default class SelectionTool {
    constructor(toolManager) {
        this.tm = toolManager
        this.mode = 'idle'
        this.dragStart = null
        this.dragShapeIds = null
        this.marquee = null
        this.originalShapes = []
    }

    handleMouseDown(pos, e) {
        const state = this.tm.state.getState()
        this.originalShapes = state.shapes.map(s => ({ ...s, points: s.points ? s.points.map(p => ({ ...p })) : undefined }))

        const hit = this._findShapeAt(pos.x, pos.y, state)
        if (hit) {
            if (e.shiftKey) {
                const newIds = state.selectedIds.includes(hit.id)
                    ? state.selectedIds.filter(id => id !== hit.id)
                    : [...state.selectedIds, hit.id]
                this.tm.state.setState({ selectedIds: newIds })
            } else {
                if (!state.selectedIds.includes(hit.id)) {
                    this.tm.state.setState({ selectedIds: [hit.id] })
                }
            }
            this.mode = 'dragging'
            this.dragStart = { x: pos.x, y: pos.y }
            this.dragShapeIds = state.selectedIds.includes(hit.id) ? [...state.selectedIds] : [hit.id]
        } else {
            this.tm.state.setState({ selectedIds: [] })
            this.mode = 'marquee'
            this.dragStart = { x: pos.x, y: pos.y }
        }
    }

    handleMouseMove(pos, e) {
        if (this.mode === 'dragging' && this.dragShapeIds) {
            const state = this.tm.state.getState()
            const dx = pos.x - this.dragStart.x
            const dy = pos.y - this.dragStart.y

            const shapes = state.shapes.map(s => {
                if (this.dragShapeIds.includes(s.id)) {
                    return this._moveShape(s, dx, dy)
                }
                return s
            })
            this.tm.state.setState({ shapes })
            this.dragStart = { x: pos.x, y: pos.y }
        } else if (this.mode === 'marquee') {
            const x = Math.min(this.dragStart.x, pos.x)
            const y = Math.min(this.dragStart.y, pos.y)
            const w = Math.abs(pos.x - this.dragStart.x)
            const h = Math.abs(pos.y - this.dragStart.y)
            this.marquee = { x, y, w, h }
        }
    }

    handleMouseUp(pos, e) {
        if (this.mode === 'dragging') {
            const current = this.tm.state.getState().shapes
            const changed = current.some((s, i) => {
                const orig = this.originalShapes.find(o => o.id === s.id)
                return orig && JSON.stringify(s) !== JSON.stringify(orig)
            })
            if (changed) {
                this.tm.pushHistory()
            }
        } else if (this.mode === 'marquee' && this.marquee) {
            const state = this.tm.state.getState()
            const selected = []

            for (const shape of state.shapes) {
                if (shape.visible === false || shape.locked) continue
                const bounds = this._getShapeBounds(shape)
                if (bounds && this._boundsOverlap(this.marquee, bounds)) {
                    selected.push(shape.id)
                }
            }

            if (e.shiftKey) {
                const existing = new Set(state.selectedIds)
                for (const id of selected) {
                    if (existing.has(id)) existing.delete(id)
                    else existing.add(id)
                }
                this.tm.state.setState({ selectedIds: [...existing] })
            } else {
                this.tm.state.setState({ selectedIds: selected })
            }

            this.marquee = null
        }

        this.mode = 'idle'
        this.dragStart = null
        this.dragShapeIds = null
    }

    handleKeyDown(e) {
        const state = this.tm.state.getState()

        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (state.selectedIds.length > 0) {
                e.preventDefault()
                this._deleteSelected(state)
            }
        }

        if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            this._selectAll(state)
        }

        if (e.key === 'Escape') {
            this.tm.state.setState({ selectedIds: [] })
        }

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && state.selectedIds.length > 0) {
            e.preventDefault()
            this._nudgeSelected(e.key, e.shiftKey ? 10 : 1, state)
        }
    }

    _findShapeAt(x, y, state) {
        for (let i = state.shapes.length - 1; i >= 0; i--) {
            const s = state.shapes[i]
            if (s.visible === false || s.locked) continue
            if (this._pointInShape(x, y, s)) return s
        }
        return null
    }

    _pointInShape(x, y, shape) {
        const margin = 5 / (this.tm.viewport ? this.tm.viewport.zoom : 1)
        switch (shape.type) {
            case 'rect':
                if (shape.isDiamond) {
                    const cx = shape.x + shape.width / 2
                    const cy = shape.y + shape.height / 2
                    const dx = Math.abs(x - cx)
                    const dy = Math.abs(y - cy)
                    return (dx / (shape.width / 2) + dy / (shape.height / 2)) <= 1 + margin / shape.width
                }
                return (
                    x >= shape.x - margin && x <= shape.x + shape.width + margin &&
                    y >= shape.y - margin && y <= shape.y + shape.height + margin
                )
            case 'circle': {
                const dx = x - shape.x
                const dy = y - shape.y
                return Math.sqrt(dx * dx + dy * dy) <= shape.radius + margin
            }
            case 'line':
            case 'arrow': {
                const A = x - shape.startX
                const B = y - shape.startY
                const C = shape.endX - shape.startX
                const D = shape.endY - shape.startY
                const dot = A * C + B * D
                const lenSq = C * C + D * D
                let t = lenSq !== 0 ? dot / lenSq : -1
                t = Math.max(0, Math.min(1, t))
                const nearX = shape.startX + t * C
                const nearY = shape.startY + t * D
                const dist = Math.sqrt((x - nearX) ** 2 + (y - nearY) ** 2)
                return dist < margin
            }
            case 'path':
                if (shape.points && shape.points.length > 1) {
                    for (let i = 0; i < shape.points.length - 1; i++) {
                        const A = x - shape.points[i].x
                        const B = y - shape.points[i].y
                        const C = shape.points[i + 1].x - shape.points[i].x
                        const D = shape.points[i + 1].y - shape.points[i].y
                        const dot = A * C + B * D
                        const lenSq = C * C + D * D
                        let t = lenSq !== 0 ? dot / lenSq : -1
                        t = Math.max(0, Math.min(1, t))
                        const nearX = shape.points[i].x + t * C
                        const nearY = shape.points[i].y + t * D
                        const dist = Math.sqrt((x - nearX) ** 2 + (y - nearY) ** 2)
                        if (dist < margin) return true
                    }
                }
                return false
            case 'text': {
                const w = shape.width || 200
                const h = (shape.fontSize || 16) * 1.4
                return (
                    x >= shape.x - margin && x <= shape.x + w + margin &&
                    y >= shape.y - h - margin && y <= shape.y + 4 + margin
                )
            }
            default:
                return false
        }
    }

    _getShapeBounds(shape) {
        const m = 6
        switch (shape.type) {
            case 'rect':
                return { x: shape.x - m, y: shape.y - m, w: shape.width + m * 2, h: shape.height + m * 2 }
            case 'circle':
                return { x: shape.x - shape.radius - m, y: shape.y - shape.radius - m, w: shape.radius * 2 + m * 2, h: shape.radius * 2 + m * 2 }
            case 'line':
            case 'arrow': {
                const minX = Math.min(shape.startX, shape.endX)
                const minY = Math.min(shape.startY, shape.endY)
                const maxX = Math.max(shape.startX, shape.endX)
                const maxY = Math.max(shape.startY, shape.endY)
                return { x: minX - m, y: minY - m, w: maxX - minX + m * 2, h: maxY - minY + m * 2 }
            }
            case 'path': {
                if (!shape.points || shape.points.length === 0) return null
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
                for (const p of shape.points) {
                    minX = Math.min(minX, p.x)
                    minY = Math.min(minY, p.y)
                    maxX = Math.max(maxX, p.x)
                    maxY = Math.max(maxY, p.y)
                }
                return { x: minX - m, y: minY - m, w: maxX - minX + m * 2, h: maxY - minY + m * 2 }
            }
            case 'text': {
                const w = shape.width || 200
                const h = (shape.fontSize || 16) * 1.4
                return { x: shape.x - m, y: shape.y - h - m, w: w + m * 2, h: h + 4 + m * 2 }
            }
            default:
                return null
        }
    }

    _boundsOverlap(a, b) {
        return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y)
    }

    _moveShape(shape, dx, dy) {
        const s = { ...shape }
        switch (s.type) {
            case 'rect':
            case 'circle':
            case 'text':
                s.x += dx
                s.y += dy
                break
            case 'line':
            case 'arrow':
                s.startX += dx
                s.startY += dy
                s.endX += dx
                s.endY += dy
                break
            case 'path':
                if (s.points) {
                    s.points = s.points.map(p => ({ x: p.x + dx, y: p.y + dy }))
                }
                break
        }
        return s
    }

    _deleteSelected(state) {
        this.tm.pushHistory()
        this.tm.state.setState({
            shapes: state.shapes.filter(s => !state.selectedIds.includes(s.id)),
            selectedIds: []
        })
    }

    _selectAll(state) {
        this.tm.state.setState({
            selectedIds: state.shapes.filter(s => s.visible !== false && !s.locked).map(s => s.id)
        })
    }

    _nudgeSelected(key, amount, state) {
        this.tm.pushHistory()
        const shapes = state.shapes.map(s => {
            if (!state.selectedIds.includes(s.id)) return s
            switch (s.type) {
                case 'rect':
                case 'circle':
                case 'text':
                    return {
                        ...s,
                        x: s.x + (key === 'ArrowRight' ? amount : key === 'ArrowLeft' ? -amount : 0),
                        y: s.y + (key === 'ArrowDown' ? amount : key === 'ArrowUp' ? -amount : 0)
                    }
                case 'line':
                case 'arrow':
                    return {
                        ...s,
                        startX: s.startX + (key === 'ArrowRight' ? amount : key === 'ArrowLeft' ? -amount : 0),
                        startY: s.startY + (key === 'ArrowDown' ? amount : key === 'ArrowUp' ? -amount : 0),
                        endX: s.endX + (key === 'ArrowRight' ? amount : key === 'ArrowLeft' ? -amount : 0),
                        endY: s.endY + (key === 'ArrowDown' ? amount : key === 'ArrowUp' ? -amount : 0)
                    }
                case 'path':
                    return {
                        ...s,
                        points: s.points.map(p => ({
                            x: p.x + (key === 'ArrowRight' ? amount : key === 'ArrowLeft' ? -amount : 0),
                            y: p.y + (key === 'ArrowDown' ? amount : key === 'ArrowUp' ? -amount : 0)
                        }))
                    }
                default:
                    return s
            }
        })
        this.tm.state.setState({ shapes })
    }

    activate() {
        if (this.tm.canvas) this.tm.canvas.style.cursor = 'default'
    }

    deactivate() {
        this.mode = 'idle'
        this.dragStart = null
        this.dragShapeIds = null
        this.marquee = null
        this.originalShapes = []
    }
}
