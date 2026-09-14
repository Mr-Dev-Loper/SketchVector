export default class Minimap {
    constructor(options = {}) {
        this.shapes = options.shapes || []
        this.viewport = options.viewport || { x: 0, y: 0, zoom: 1 }
        this.canvasWidth = options.canvasWidth || 800
        this.canvasHeight = options.canvasHeight || 600
        this.onClick = options.onClick || (() => {})
        this.el = null
        this.canvas = null
        this.ctx = null
        this.width = 150
        this.height = 100
    }

    render() {
        this.el = document.createElement('div')
        this.el.className = 'sv-minimap'
        this.canvas = document.createElement('canvas')
        this.canvas.width = this.width
        this.canvas.height = this.height
        this.ctx = this.canvas.getContext('2d')
        this.el.appendChild(this.canvas)
        this._bindEvents()
        this.draw()
        return this.el
    }

    draw() {
        if (!this.ctx) return
        const ctx = this.ctx
        const w = this.width
        const h = this.height

        ctx.clearRect(0, 0, w, h)
        ctx.fillStyle = 'rgba(30, 30, 30, 0.85)'
        ctx.fillRect(0, 0, w, h)

        if (this.shapes.length === 0) {
            ctx.strokeStyle = '#555'
            ctx.lineWidth = 1
            ctx.strokeRect(10, 10, w - 20, h - 20)
            ctx.fillStyle = '#888'
            ctx.font = '10px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('Empty', w / 2, h / 2 + 3)
            this._drawViewport()
            return
        }

        const bounds = this._getBounds()
        if (!bounds) {
            this._drawViewport()
            return
        }

        const padding = 10
        const contentW = bounds.maxX - bounds.minX || 1
        const contentH = bounds.maxY - bounds.minY || 1
        const scaleX = (w - padding * 2) / contentW
        const scaleY = (h - padding * 2) / contentH
        const scale = Math.min(scaleX, scaleY)
        const offsetX = padding + (w - padding * 2 - contentW * scale) / 2 - bounds.minX * scale
        const offsetY = padding + (h - padding * 2 - contentH * scale) / 2 - bounds.minY * scale

        ctx.save()
        ctx.translate(offsetX, offsetY)
        ctx.scale(scale, scale)

        for (const shape of this.shapes) {
            if (shape.visible === false) continue
            ctx.fillStyle = shape.fill !== 'transparent' ? shape.fill : 'rgba(150,150,150,0.3)'
            ctx.strokeStyle = shape.stroke || '#888'
            ctx.lineWidth = 2 / scale

            switch (shape.type) {
                case 'rect':
                    ctx.fillRect(shape.x, shape.y, shape.width, shape.height)
                    if (shape.fill === 'transparent') ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
                    break
                case 'circle':
                    ctx.beginPath()
                    ctx.arc(shape.x, shape.y, shape.radius || 20, 0, Math.PI * 2)
                    ctx.fill()
                    if (shape.fill === 'transparent') ctx.stroke()
                    break
                case 'line':
                case 'arrow':
                    ctx.beginPath()
                    ctx.moveTo(shape.startX, shape.startY)
                    ctx.lineTo(shape.endX, shape.endY)
                    ctx.stroke()
                    break
                case 'path':
                    if (shape.points && shape.points.length > 1) {
                        ctx.beginPath()
                        ctx.moveTo(shape.points[0].x, shape.points[0].y)
                        for (let i = 1; i < shape.points.length; i++) {
                            ctx.lineTo(shape.points[i].x, shape.points[i].y)
                        }
                        ctx.stroke()
                    }
                    break
                case 'text':
                    ctx.fillRect(shape.x, shape.y - 14, 60, 14)
                    break
            }
        }

        ctx.restore()

        this._drawViewport(offsetX, offsetY, scale)
    }

    _drawViewport(offsetX = 0, offsetY = 0, scale = 1) {
        const ctx = this.ctx
        const screenW = this.canvasWidth / this.viewport.zoom
        const screenH = this.canvasHeight / this.viewport.zoom
        const screenX = -this.viewport.x / this.viewport.zoom
        const screenY = -this.viewport.y / this.viewport.zoom

        const vx = screenX * scale + offsetX
        const vy = screenY * scale + offsetY
        const vw = screenW * scale
        const vh = screenH * scale

        ctx.strokeStyle = '#ff4444'
        ctx.lineWidth = 1.5
        ctx.strokeRect(vx, vy, vw, vh)
        ctx.fillStyle = 'rgba(255, 68, 68, 0.08)'
        ctx.fillRect(vx, vy, vw, vh)
    }

    _getBounds() {
        if (this.shapes.length === 0) return null
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        for (const s of this.shapes) {
            switch (s.type) {
                case 'rect':
                    minX = Math.min(minX, s.x); minY = Math.min(minY, s.y)
                    maxX = Math.max(maxX, s.x + s.width); maxY = Math.max(maxY, s.y + s.height)
                    break
                case 'circle':
                    minX = Math.min(minX, s.x - (s.radius || 20)); minY = Math.min(minY, s.y - (s.radius || 20))
                    maxX = Math.max(maxX, s.x + (s.radius || 20)); maxY = Math.max(maxY, s.y + (s.radius || 20))
                    break
                case 'line': case 'arrow':
                    minX = Math.min(minX, s.startX, s.endX); minY = Math.min(minY, s.startY, s.endY)
                    maxX = Math.max(maxX, s.startX, s.endX); maxY = Math.max(maxY, s.startY, s.endY)
                    break
                case 'path':
                    if (s.points) for (const p of s.points) {
                        minX = Math.min(minX, p.x); minY = Math.min(minY, p.y)
                        maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y)
                    }
                    break
                case 'text':
                    minX = Math.min(minX, s.x); minY = Math.min(minY, s.y - 20)
                    maxX = Math.max(maxX, s.x + 100); maxY = Math.max(maxY, s.y)
                    break
            }
        }
        return { minX, minY, maxX, maxY }
    }

    _bindEvents() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect()
            const clickX = e.clientX - rect.left
            const clickY = e.clientY - rect.top

            const bounds = this._getBounds()
            if (!bounds) return

            const padding = 10
            const contentW = bounds.maxX - bounds.minX || 1
            const contentH = bounds.maxY - bounds.minY || 1
            const scaleX = (this.width - padding * 2) / contentW
            const scaleY = (this.height - padding * 2) / contentH
            const scale = Math.min(scaleX, scaleY)
            const offsetX = padding + (this.width - padding * 2 - contentW * scale) / 2 - bounds.minX * scale
            const offsetY = padding + (this.height - padding * 2 - contentH * scale) / 2 - bounds.minY * scale

            const worldX = (clickX - offsetX) / scale
            const worldY = (clickY - offsetY) / scale

            const screenX = worldX * this.viewport.zoom + this.viewport.x
            const screenY = worldY * this.viewport.zoom + this.viewport.y

            this.onClick(screenX, screenY)
        })
    }

    update(shapes, viewport, canvasWidth, canvasHeight) {
        this.shapes = shapes || this.shapes
        if (viewport) this.viewport = viewport
        if (canvasWidth) this.canvasWidth = canvasWidth
        if (canvasHeight) this.canvasHeight = canvasHeight
        this.draw()
    }

    mount(parent) {
        if (!this.el) this.render()
        parent.appendChild(this.el)
        return this.el
    }
}
