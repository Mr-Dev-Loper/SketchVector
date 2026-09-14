import Viewport from './Viewport.js';

export default class Canvas {
    constructor(container) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.viewport = new Viewport();
        this.shapes = [];
        this.animationId = null;
        this.renderer = null;

        if (container) {
            container.appendChild(this.canvas);
        }

        this.setupResize();
    }

    setupResize() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);
    }

    getCanvas() {
        return this.canvas;
    }

    getCtx() {
        return this.ctx;
    }

    getViewport() {
        return this.viewport;
    }

    getShapes() {
        return this.shapes;
    }

    addShape(shape) {
        this.shapes.push(shape);
    }

    removeShape(shape) {
        const index = this.shapes.indexOf(shape);
        if (index > -1) {
            this.shapes.splice(index, 1);
        }
    }

    findShapeAt(worldX, worldY) {
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            if (this.hitTest(this.shapes[i], worldX, worldY)) {
                return this.shapes[i];
            }
        }
        return null;
    }

    hitTest(shape, x, y) {
        const margin = 5 / this.viewport.zoomLevel;

        switch (shape.type) {
            case 'rect':
                return (
                    x >= shape.x - margin &&
                    x <= shape.x + shape.width + margin &&
                    y >= shape.y - margin &&
                    y <= shape.y + shape.height + margin
                );

            case 'circle': {
                const dx = x - shape.x;
                const dy = y - shape.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                return dist <= shape.radius + margin;
            }

            case 'line':
            case 'arrow':
                return this.pointToLineDistance(x, y, shape.startX, shape.startY, shape.endX, shape.endY) < margin;

            case 'path':
                return this.hitTestPath(shape.points, x, y, margin);

            case 'text': {
                const metrics = this.ctx.measureText(shape.text || '');
                const textWidth = metrics.width;
                const textHeight = 20;
                return (
                    x >= shape.x - margin &&
                    x <= shape.x + textWidth + margin &&
                    y >= shape.y - textHeight - margin &&
                    y <= shape.y + margin
                );
            }

            default:
                return false;
        }
    }

    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) {
            param = dot / lenSq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    hitTestPath(points, x, y, margin) {
        if (!points || points.length < 2) return false;

        for (let i = 0; i < points.length - 1; i++) {
            const dist = this.pointToLineDistance(
                x, y,
                points[i].x, points[i].y,
                points[i + 1].x, points[i + 1].y
            );
            if (dist < margin) return true;
        }
        return false;
    }

    getContentBounds() {
        if (this.shapes.length === 0) return null;

        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (const shape of this.shapes) {
            switch (shape.type) {
                case 'rect':
                    minX = Math.min(minX, shape.x);
                    minY = Math.min(minY, shape.y);
                    maxX = Math.max(maxX, shape.x + shape.width);
                    maxY = Math.max(maxY, shape.y + shape.height);
                    break;
                case 'circle':
                    minX = Math.min(minX, shape.x - shape.radius);
                    minY = Math.min(minY, shape.y - shape.radius);
                    maxX = Math.max(maxX, shape.x + shape.radius);
                    maxY = Math.max(maxY, shape.y + shape.radius);
                    break;
                case 'line':
                case 'arrow':
                    minX = Math.min(minX, shape.startX, shape.endX);
                    minY = Math.min(minY, shape.startY, shape.endY);
                    maxX = Math.max(maxX, shape.startX, shape.endX);
                    maxY = Math.max(maxY, shape.startY, shape.endY);
                    break;
                case 'path':
                    if (shape.points) {
                        for (const p of shape.points) {
                            minX = Math.min(minX, p.x);
                            minY = Math.min(minY, p.y);
                            maxX = Math.max(maxX, p.x);
                            maxY = Math.max(maxY, p.y);
                        }
                    }
                    break;
                case 'text':
                    minX = Math.min(minX, shape.x);
                    minY = Math.min(minY, shape.y - 20);
                    maxX = Math.max(maxX, shape.x + 100);
                    maxY = Math.max(maxY, shape.y);
                    break;
            }
        }

        return { minX, minY, maxX, maxY };
    }

    setRenderer(renderer) {
        this.renderer = renderer;
    }

    startRenderLoop() {
        const render = () => {
            if (this.renderer) {
                this.renderer.clear();
                this.renderer.renderAll(this.shapes, this.viewport);
            }
            this.animationId = requestAnimationFrame(render);
        };
        render();
    }

    stopRenderLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}
