export default class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridVisible = true;
        this.gridSize = 20;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderAll(shapes, viewport) {
        this.ctx.save();
        viewport.applyTransform(this.ctx);

        if (this.gridVisible) {
            this.renderGrid(viewport);
        }

        for (const shape of shapes) {
            this.renderShape(shape);
        }

        this.ctx.restore();
    }

    renderGrid(viewport) {
        const gridSize = this.gridSize;
        const ctx = this.ctx;

        const startX = Math.floor(-viewport.x / viewport.zoomLevel / gridSize) * gridSize - gridSize;
        const startY = Math.floor(-viewport.y / viewport.zoomLevel / gridSize) * gridSize - gridSize;
        const endX = startX + this.canvas.width / viewport.zoomLevel + gridSize * 2;
        const endY = startY + this.canvas.height / viewport.zoomLevel + gridSize * 2;

        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 0.5;

        ctx.beginPath();
        for (let x = startX; x <= endX; x += gridSize) {
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
        }
        for (let y = startY; y <= endY; y += gridSize) {
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
        }
        ctx.stroke();
    }

    renderShape(shape) {
        const ctx = this.ctx;
        ctx.save();

        if (shape.opacity !== undefined) {
            ctx.globalAlpha = shape.opacity;
        }

        if (shape.rotation) {
            const cx = shape.x + (shape.width || 0) / 2;
            const cy = shape.y + (shape.height || 0) / 2;
            ctx.translate(cx, cy);
            ctx.rotate((shape.rotation * Math.PI) / 180);
            ctx.translate(-cx, -cy);
        }

        ctx.fillStyle = shape.fill || 'transparent';
        ctx.strokeStyle = shape.stroke || '#000000';
        ctx.lineWidth = shape.strokeWidth || 2;

        switch (shape.type) {
            case 'rect':
                this.renderRect(shape);
                break;
            case 'circle':
                this.renderCircle(shape);
                break;
            case 'line':
                this.renderLine(shape);
                break;
            case 'arrow':
                this.renderArrow(shape);
                break;
            case 'path':
                this.renderPath(shape);
                break;
            case 'text':
                this.renderText(shape);
                break;
        }

        ctx.restore();
    }

    renderRect(shape) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.rect(shape.x, shape.y, shape.width, shape.height);

        if (shape.fill && shape.fill !== 'transparent') {
            ctx.fill();
        }
        ctx.stroke();
    }

    renderCircle(shape) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);

        if (shape.fill && shape.fill !== 'transparent') {
            ctx.fill();
        }
        ctx.stroke();
    }

    renderLine(shape) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();
    }

    renderArrow(shape) {
        const ctx = this.ctx;
        const headLength = 15;
        const dx = shape.endX - shape.startX;
        const dy = shape.endY - shape.startY;
        const angle = Math.atan2(dy, dx);

        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(shape.endX, shape.endY);
        ctx.lineTo(
            shape.endX - headLength * Math.cos(angle - Math.PI / 6),
            shape.endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(shape.endX, shape.endY);
        ctx.lineTo(
            shape.endX - headLength * Math.cos(angle + Math.PI / 6),
            shape.endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
    }

    renderPath(shape) {
        const ctx = this.ctx;
        const points = shape.points;

        if (!points || points.length < 2) return;

        ctx.beginPath();

        if (shape.handDrawn) {
            this.renderHandDrawnPath(points);
        } else {
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
        }
    }

    renderHandDrawnPath(points) {
        const ctx = this.ctx;
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];

            const midX = (prev.x + curr.x) / 2;
            const midY = (prev.y + curr.y) / 2;

            const jitterX = (Math.random() - 0.5) * 2;
            const jitterY = (Math.random() - 0.5) * 2;

            ctx.quadraticCurveTo(
                prev.x + jitterX,
                prev.y + jitterY,
                midX,
                midY
            );
        }

        ctx.stroke();
    }

    renderText(shape) {
        const ctx = this.ctx;
        ctx.font = `${shape.fontSize || 16}px ${shape.fontFamily || 'Arial'}`;
        ctx.textBaseline = 'top';

        if (shape.fill && shape.fill !== 'transparent') {
            ctx.fillText(shape.text || '', shape.x, shape.y);
        }
        ctx.strokeText(shape.text || '', shape.x, shape.y);
    }

    setGridVisible(visible) {
        this.gridVisible = visible;
    }

    setGridSize(size) {
        this.gridSize = size;
    }
}
