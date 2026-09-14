export default class Grid {
    constructor(viewport) {
        this.viewport = viewport;
        this.size = 20;
        this.enabled = false;
        this.snapEnabled = false;
        this.darkMode = false;
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    toggleSnap() {
        this.snapEnabled = !this.snapEnabled;
        return this.snapEnabled;
    }

    setGridSize(size) {
        this.size = Math.max(5, Math.min(100, size));
    }

    snapToGrid(x, y) {
        if (!this.snapEnabled) return { x, y };
        return {
            x: Math.round(x / this.size) * this.size,
            y: Math.round(y / this.size) * this.size
        };
    }

    render(ctx, canvasWidth, canvasHeight) {
        if (!this.enabled) return;

        const zoom = this.viewport.zoom;
        const offsetX = this.viewport.x;
        const offsetY = this.viewport.y;
        const size = this.size;

        const lineWidth = Math.max(0.5, 1 / zoom);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = this.darkMode ? '#404040' : '#e0e0e0';

        const startX = Math.floor(-offsetX / zoom / size) * size;
        const startY = Math.floor(-offsetY / zoom / size) * size;
        const endX = Math.ceil((canvasWidth - offsetX) / zoom / size) * size;
        const endY = Math.ceil((canvasHeight - offsetY) / zoom / size) * size;

        ctx.beginPath();
        for (let x = startX; x <= endX; x += size) {
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
        }
        for (let y = startY; y <= endY; y += size) {
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
        }
        ctx.stroke();
    }
}
