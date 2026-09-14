export default class Viewport {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
        this.minZoom = 0.1;
        this.maxZoom = 10;
    }

    pan(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    zoom(delta, centerX, centerY) {
        const zoomFactor = delta > 0 ? 0.9 : 1.1;
        const newZoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.zoom * zoomFactor));

        const worldX = (centerX - this.x) / this.zoom;
        const worldY = (centerY - this.y) / this.zoom;

        this.zoom = newZoom;
        this.x = centerX - worldX * this.zoom;
        this.y = centerY - worldY * this.zoom;
    }

    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.x) / this.zoom,
            y: (screenY - this.y) / this.zoom
        };
    }

    worldToScreen(worldX, worldY) {
        return {
            x: worldX * this.zoom + this.x,
            y: worldY * this.zoom + this.y
        };
    }

    fitToScreen(width, height, contentBounds) {
        if (!contentBounds) {
            this.x = 0;
            this.y = 0;
            this.zoom = 1;
            return;
        }

        const padding = 50;
        const contentWidth = contentBounds.maxX - contentBounds.minX;
        const contentHeight = contentBounds.maxY - contentBounds.minY;

        if (contentWidth === 0 || contentHeight === 0) {
            this.x = 0;
            this.y = 0;
            this.zoom = 1;
            return;
        }

        const scaleX = (width - padding * 2) / contentWidth;
        const scaleY = (height - padding * 2) / contentHeight;
        this.zoom = Math.min(scaleX, scaleY);

        this.x = (width - contentWidth * this.zoom) / 2 - contentBounds.minX * this.zoom;
        this.y = (height - contentHeight * this.zoom) / 2 - contentBounds.minY * this.zoom;
    }

    getTransform() {
        return {
            x: this.x,
            y: this.y,
            zoom: this.zoom
        };
    }

    applyTransform(ctx) {
        ctx.translate(this.x, this.y);
        ctx.scale(this.zoom, this.zoom);
    }

    resetTransform(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}
