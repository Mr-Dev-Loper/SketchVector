import Shape from './Shape.js'
import { generateId, getBoundingBox } from '../utils/math.js'

export default class Path extends Shape {
    constructor(props = {}) {
        super('path', props)
        this.points = props.points || []
        this.tool = props.tool || 'pen'
    }

    addPoint(x, y) {
        this.points.push({ x, y })
    }

    getPoints() {
        return this.points
    }

    simplify(tolerance = 1.5) {
        if (this.points.length <= 2) return
        const simplified = [this.points[0]]
        for (let i = 1; i < this.points.length - 1; i++) {
            const prev = simplified[simplified.length - 1]
            const curr = this.points[i]
            const dx = curr.x - prev.x
            const dy = curr.y - prev.y
            if (Math.sqrt(dx * dx + dy * dy) >= tolerance) {
                simplified.push(curr)
            }
        }
        simplified.push(this.points[this.points.length - 1])
        this.points = simplified
    }

    getBounds() {
        const b = getBoundingBox(this.points)
        return { x: b.x, y: b.y, width: b.width, height: b.height }
    }

    containsPoint(x, y) {
        for (const p of this.points) {
            const dx = x - p.x
            const dy = y - p.y
            if (dx * dx + dy * dy <= 25) return true
        }
        return false
    }

    serialize() {
        return { ...this, points: this.points.map(p => ({ ...p })) }
    }

    clone() {
        const data = this.serialize()
        data.id = generateId()
        data.points = this.points.map(p => ({ ...p }))
        return data
    }
}
