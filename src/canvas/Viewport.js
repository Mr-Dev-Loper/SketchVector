export default class Viewport {
    constructor() {
        this.x = 0
        this.y = 0
        this.zoomLevel = 3
        this.minZoom = 0.1
        this.maxZoom = 30
        this.baseZoom = 3
    }

    pan(dx, dy) {
        this.x += dx
        this.y += dy
    }

    zoom(delta, cx, cy) {
        const step = this.baseZoom * 0.1
        const newZoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.zoomLevel + delta * step))
        const wx = (cx - this.x) / this.zoomLevel
        const wy = (cy - this.y) / this.zoomLevel
        this.zoomLevel = newZoom
        this.x = cx - wx * this.zoomLevel
        this.y = cy - wy * this.zoomLevel
    }

    setZoom(newZoom) {
        const clamped = Math.min(this.maxZoom, Math.max(this.minZoom, newZoom))
        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2
        const wx = (cx - this.x) / this.zoomLevel
        const wy = (cy - this.y) / this.zoomLevel
        this.zoomLevel = clamped
        this.x = cx - wx * this.zoomLevel
        this.y = cy - wy * this.zoomLevel
    }

    getDisplayZoom() {
        return Math.round((this.zoomLevel / this.baseZoom) * 100)
    }

    screenToWorld(sx, sy) {
        return { x: (sx - this.x) / this.zoomLevel, y: (sy - this.y) / this.zoomLevel }
    }

    worldToScreen(wx, wy) {
        return { x: wx * this.zoomLevel + this.x, y: wy * this.zoomLevel + this.y }
    }

    fitToScreen(w, h, bounds) {
        if (!bounds) { this.x = 0; this.y = 0; this.zoomLevel = 3; return }
        const pad = 60
        const cw = bounds.maxX - bounds.minX, ch = bounds.maxY - bounds.minY
        if (cw <= 0 || ch <= 0) { this.x = 0; this.y = 0; this.zoomLevel = 3; return }
        this.zoomLevel = Math.min((w - pad * 2) / cw, (h - pad * 2) / ch)
        this.x = (w - cw * this.zoomLevel) / 2 - bounds.minX * this.zoomLevel
        this.y = (h - ch * this.zoomLevel) / 2 - bounds.minY * this.zoomLevel
    }

    applyTransform(ctx) {
        ctx.translate(this.x, this.y)
        ctx.scale(this.zoomLevel, this.zoomLevel)
    }
}
