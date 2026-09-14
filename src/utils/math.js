export function generateId() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9)
}

export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1
    const dy = y2 - y1
    return Math.sqrt(dx * dx + dy * dy)
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
}

export function lerp(start, end, t) {
    return start + (end - start) * t
}

export function pointInRect(px, py, x, y, w, h) {
    return px >= x && px <= x + w && py >= y && py <= y + h
}

export function pointInCircle(px, py, cx, cy, r) {
    return distance(px, py, cx, cy) <= r
}

export function getBoundingBox(points) {
    if (!points || points.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 }
    }
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const p of points) {
        if (p.x < minX) minX = p.x
        if (p.y < minY) minY = p.y
        if (p.x > maxX) maxX = p.x
        if (p.y > maxY) maxY = p.y
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}
