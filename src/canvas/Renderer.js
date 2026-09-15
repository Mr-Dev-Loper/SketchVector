export default class Renderer {
    constructor(canvas) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
    }

    renderGrid(viewport, screenW, screenH) {
        const ctx = this.ctx
        const zoom = viewport.zoomLevel
        const gridSize = 20

        const startX = Math.floor(-viewport.x / zoom / gridSize) * gridSize - gridSize
        const startY = Math.floor(-viewport.y / zoom / gridSize) * gridSize - gridSize
        const endX = startX + screenW / zoom + gridSize * 2
        const endY = startY + screenH / zoom + gridSize * 2

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
        ctx.fillStyle = isDark ? '#333' : '#ddd'

        const step = gridSize
        const dotSize = 1.2 / zoom

        for (let x = startX; x <= endX; x += step) {
            for (let y = startY; y <= endY; y += step) {
                ctx.beginPath()
                ctx.arc(x, y, dotSize, 0, Math.PI * 2)
                ctx.fill()
            }
        }
    }

    renderShape(shape) {
        const ctx = this.ctx
        ctx.save()
        if (shape.opacity !== undefined) ctx.globalAlpha = shape.opacity
        ctx.fillStyle = shape.fill || 'transparent'
        ctx.strokeStyle = shape.stroke || '#1e1e1e'
        ctx.lineWidth = shape.strokeWidth || 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        this._applyStrokeStyle(shape)

        switch (shape.type) {
            case 'rect': this._rect(shape); break
            case 'circle': this._circle(shape); break
            case 'line': this._line(shape); break
            case 'arrow': this._arrow(shape); break
            case 'path': this._path(shape); break
            case 'text': this._text(shape); break
        }
        ctx.restore()
    }

    renderShapeTo(ctx, shape) {
        const prev = this.ctx
        this.ctx = ctx
        this.renderShape(shape)
        this.ctx = prev
    }

    _applyStrokeStyle(shape) {
        const ctx = this.ctx
        const style = shape.strokeStyle || 'solid'
        if (style === 'dashed') ctx.setLineDash([8, 4])
        else if (style === 'dotted') ctx.setLineDash([2, 4])
        else ctx.setLineDash([])
    }

    _roundRect(x, y, w, h, r) {
        const ctx = this.ctx
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + w - r, y)
        ctx.arcTo(x + w, y, x + w, y + r, r)
        ctx.lineTo(x + w, y + h - r)
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
        ctx.lineTo(x + r, y + h)
        ctx.arcTo(x, y + h, x, y + h - r, r)
        ctx.lineTo(x, y + r)
        ctx.arcTo(x, y, x + r, y, r)
        ctx.closePath()
    }

    _rect(s) {
        const ctx = this.ctx
        if (s.isDiamond) {
            const cx = s.x + (s.width || 0) / 2, cy = s.y + (s.height || 0) / 2
            ctx.beginPath()
            ctx.moveTo(cx, s.y)
            ctx.lineTo(s.x + (s.width || 0), cy)
            ctx.lineTo(cx, s.y + (s.height || 0))
            ctx.lineTo(s.x, cy)
            ctx.closePath()
            if (s.fill && s.fill !== 'transparent') ctx.fill()
            ctx.stroke()
        } else {
            const rx = s.edges === 'round' ? Math.min(12, (s.width || 0) / 4, (s.height || 0) / 4) : 0
            if (rx > 0) {
                this._roundRect(s.x, s.y, s.width || 0, s.height || 0, rx)
            } else {
                ctx.beginPath()
                ctx.rect(s.x, s.y, s.width || 0, s.height || 0)
            }
            if (s.fill && s.fill !== 'transparent') ctx.fill()
            ctx.stroke()
        }
    }

    _circle(s) {
        const ctx = this.ctx
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.radius || 20, 0, Math.PI * 2)
        if (s.fill && s.fill !== 'transparent') ctx.fill()
        ctx.stroke()
    }

    _line(s) {
        const ctx = this.ctx
        ctx.beginPath()
        ctx.moveTo(s.startX, s.startY)
        ctx.lineTo(s.endX, s.endY)
        ctx.stroke()
    }

    _arrow(s) {
        const ctx = this.ctx
        const headLen = 14
        const dx = s.endX - s.startX, dy = s.endY - s.startY
        const angle = Math.atan2(dy, dx)

        ctx.beginPath()
        ctx.moveTo(s.startX, s.startY)
        ctx.lineTo(s.endX, s.endY)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(s.endX, s.endY)
        ctx.lineTo(s.endX - headLen * Math.cos(angle - Math.PI / 6), s.endY - headLen * Math.sin(angle - Math.PI / 6))
        ctx.moveTo(s.endX, s.endY)
        ctx.lineTo(s.endX - headLen * Math.cos(angle + Math.PI / 6), s.endY - headLen * Math.sin(angle + Math.PI / 6))
        ctx.stroke()
    }

    _path(s) {
        const pts = s.points
        if (!pts || pts.length < 2) return
        const ctx = this.ctx
        ctx.beginPath()
        ctx.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length; i++) {
            if (i < pts.length - 1) {
                const mx = (pts[i].x + pts[i + 1].x) / 2
                const my = (pts[i].y + pts[i + 1].y) / 2
                ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my)
            } else {
                ctx.lineTo(pts[i].x, pts[i].y)
            }
        }
        ctx.stroke()
    }

    _text(s) {
        const ctx = this.ctx
        ctx.font = `${s.fontSize || 20}px ${s.fontFamily || 'Arial'}`
        ctx.textBaseline = 'top'
        ctx.textAlign = s.textAlign || 'left'
        ctx.fillStyle = s.stroke || '#1e1e1e'
        const text = s.text || ''
        if (s.textAlign === 'center') {
            ctx.fillText(text, s.x + (s.width || 0) / 2, s.y - (s.fontSize || 20))
        } else if (s.textAlign === 'right') {
            ctx.fillText(text, s.x + (s.width || 0), s.y - (s.fontSize || 20))
        } else {
            ctx.fillText(text, s.x, s.y - (s.fontSize || 20))
        }
    }
}
