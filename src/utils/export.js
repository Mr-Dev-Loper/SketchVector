export default class Exporter {
    static exportToPNG(canvas, shapes, viewport) {
        const offscreen = document.createElement('canvas');
        const padding = 50;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        for (const shape of shapes) {
            const bounds = Exporter._getShapeBounds(shape);
            if (bounds) {
                minX = Math.min(minX, bounds.x);
                minY = Math.min(minY, bounds.y);
                maxX = Math.max(maxX, bounds.x + bounds.w);
                maxY = Math.max(maxY, bounds.y + bounds.h);
            }
        }

        if (!isFinite(minX)) {
            minX = 0; minY = 0; maxX = canvas.width; maxY = canvas.height;
        }

        offscreen.width = (maxX - minX) + padding * 2;
        offscreen.height = (maxY - minY) + padding * 2;

        const ctx = offscreen.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, offscreen.width, offscreen.height);
        ctx.translate(-minX + padding, -minY + padding);

        for (const shape of shapes) {
            if (shape.visible === false) continue;
            Exporter._drawShape(ctx, shape);
        }

        const link = document.createElement('a');
        link.download = 'sketch-vector.png';
        link.href = offscreen.toDataURL('image/png');
        link.click();
    }

    static exportToSVG(shapes, viewport) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        for (const shape of shapes) {
            const bounds = Exporter._getShapeBounds(shape);
            if (bounds) {
                minX = Math.min(minX, bounds.x);
                minY = Math.min(minY, bounds.y);
                maxX = Math.max(maxX, bounds.x + bounds.w);
                maxY = Math.max(maxY, bounds.y + bounds.h);
            }
        }

        if (!isFinite(minX)) {
            minX = 0; minY = 0; maxX = 800; maxY = 600;
        }

        const padding = 50;
        const width = (maxX - minX) + padding * 2;
        const height = (maxY - minY) + padding * 2;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
        svg += `<rect width="100%" height="100%" fill="white"/>`;
        svg += `<g transform="translate(${-minX + padding}, ${-minY + padding})">`;

        for (const shape of shapes) {
            if (shape.visible === false) continue;
            svg += Exporter._shapeToSVG(shape);
        }

        svg += '</g></svg>';

        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = 'sketch-vector.svg';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }

    static exportToJSON(state) {
        const json = JSON.stringify(state, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = 'sketch-vector.json';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }

    static importFromJSON(callback) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    callback(data);
                } catch (err) {
                    console.error('Failed to parse JSON:', err);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    static _getShapeBounds(shape) {
        switch (shape.type) {
            case 'rect':
                return { x: shape.x, y: shape.y, w: shape.width, h: shape.height };
            case 'circle':
                return { x: shape.x - (shape.radius || 20), y: shape.y - (shape.radius || 20), w: (shape.radius || 20) * 2, h: (shape.radius || 20) * 2 };
            case 'text':
                return { x: shape.x, y: shape.y - 20, w: 150, h: 24 };
            case 'line':
            case 'arrow':
                return { x: Math.min(shape.startX, shape.endX), y: Math.min(shape.startY, shape.endY), w: Math.abs(shape.endX - shape.startX), h: Math.abs(shape.endY - shape.startY) };
            default:
                return null;
        }
    }

    static _drawShape(ctx, shape) {
        ctx.globalAlpha = shape.opacity ?? 1;
        ctx.lineWidth = shape.strokeWidth || 2;
        ctx.strokeStyle = shape.stroke || '#000';
        if (shape.fill && shape.fill !== 'transparent') {
            ctx.fillStyle = shape.fill;
        }

        switch (shape.type) {
            case 'rect':
                if (shape.fill && shape.fill !== 'transparent') ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
                ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                break;
            case 'circle':
                ctx.beginPath();
                ctx.arc(shape.x, shape.y, shape.radius || 20, 0, Math.PI * 2);
                if (shape.fill && shape.fill !== 'transparent') ctx.fill();
                ctx.stroke();
                break;
            case 'line':
                ctx.beginPath();
                ctx.moveTo(shape.startX, shape.startY);
                ctx.lineTo(shape.endX, shape.endY);
                ctx.stroke();
                break;
            case 'arrow':
                Exporter._drawArrow(ctx, shape.startX, shape.startY, shape.endX, shape.endY);
                break;
            case 'path':
                if (shape.points && shape.points.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(shape.points[0].x, shape.points[0].y);
                    for (let i = 1; i < shape.points.length; i++) {
                        ctx.lineTo(shape.points[i].x, shape.points[i].y);
                    }
                    ctx.stroke();
                }
                break;
            case 'text':
                ctx.font = `${shape.fontSize || 16}px ${shape.fontFamily || 'sans-serif'}`;
                ctx.fillStyle = shape.stroke || '#000';
                ctx.fillText(shape.text || '', shape.x, shape.y);
                break;
        }
        ctx.globalAlpha = 1;
    }

    static _drawArrow(ctx, x1, y1, x2, y2) {
        const headLength = 15;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const angle = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }

    static _shapeToSVG(shape) {
        const stroke = shape.stroke || '#000';
        const fill = shape.fill && shape.fill !== 'transparent' ? shape.fill : 'none';
        const sw = shape.strokeWidth || 2;
        const opacity = shape.opacity ?? 1;

        switch (shape.type) {
            case 'rect':
                return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
            case 'circle':
                return `<circle cx="${shape.x}" cy="${shape.y}" r="${shape.radius || 20}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
            case 'line':
                return `<line x1="${shape.startX}" y1="${shape.startY}" x2="${shape.endX}" y2="${shape.endY}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
            case 'arrow': {
                const dx = shape.endX - shape.startX;
                const dy = shape.endY - shape.startY;
                const angle = Math.atan2(dy, dx);
                const hl = 15;
                const ax1 = shape.endX - hl * Math.cos(angle - Math.PI / 6);
                const ay1 = shape.endY - hl * Math.sin(angle - Math.PI / 6);
                const ax2 = shape.endX - hl * Math.cos(angle + Math.PI / 6);
                const ay2 = shape.endY - hl * Math.sin(angle + Math.PI / 6);
                return `<g opacity="${opacity}"><line x1="${shape.startX}" y1="${shape.startY}" x2="${shape.endX}" y2="${shape.endY}" stroke="${stroke}" stroke-width="${sw}"/><polygon points="${shape.endX},${shape.endY} ${ax1},${ay1} ${ax2},${ay2}" fill="${stroke}"/></g>`;
            }
            case 'text':
                return `<text x="${shape.x}" y="${shape.y}" font-size="${shape.fontSize || 16}" fill="${stroke}" opacity="${opacity}">${shape.text || ''}</text>`;
            case 'path':
                if (shape.points && shape.points.length > 1) {
                    const d = shape.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
                    return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
                }
                return '';
            default:
                return '';
        }
    }
}
