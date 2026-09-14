export default class Viewport {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.zoomLevel = 1;
        this.minZoom = 0.1;
        this.maxZoom = 10;
    }

    pan(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    zoom(delta, centerX, centerY) {
        const zoomFactor = delta > 0 ? 0.9 : 1.1;
        const newZoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.zoomLevel * zoomFactor));

        const worldX = (centerX - this.x) / this.zoomLevel;
        const worldY = (centerY - this.y) / this.zoomLevel;

        this.zoomLevel = newZoom;
        this.x = centerX - worldX * this.zoomLevel;
        this.y = centerY - worldY * this.zoomLevel;
    }

    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.x) / this.zoomLevel,
            y: (screenY - this.y) / this.zoomLevel
        };
    }

    worldToScreen(worldX, worldY) {
        return {
            x: worldX * this.zoomLevel + this.x,
            y: worldY * this.zoomLevel + this.y
        };
    }

    fitToScreen(width, height, contentBounds) {
        if (!contentBounds) {
            this.x = 0;
            this.y = 0;
            this.zoomLevel = 1;
            return;
        }

        const padding = 50;
        const contentWidth = contentBounds.maxX - contentBounds.minX;
        const contentHeight = contentBounds.maxY - contentBounds.minY;

        if (contentWidth === 0 || contentHeight === 0) {
            this.x = 0;
            this.y = 0;
            this.zoomLevel = 1;
            return;
        }

        const scaleX = (width - padding * 2) / contentWidth;
        const scaleY = (height - padding * 2) / contentHeight;
        this.zoomLevel = Math.min(scaleX, scaleY);

        this.x = (width - contentWidth * this.zoomLevel) / 2 - contentBounds.minX * this.zoomLevel;
        this.y = (height - contentHeight * this.zoomLevel) / 2 - contentBounds.minY * this.zoomLevel;
    }

    getTransform() {
        return {
            x: this.x,
            y: this.y,
            zoom: this.zoomLevel
        };
    }

    applyTransform(ctx) {
        ctx.translate(this.x, this.y);
        ctx.scale(this.zoomLevel, this.zoomLevel);
    }

    resetTransform(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}
