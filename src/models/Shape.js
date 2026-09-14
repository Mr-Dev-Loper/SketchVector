import { generateId, pointInRect, getBoundingBox } from '../utils/math.js'

export default class Shape {
    constructor(type, props = {}) {
        this.id = generateId()
        this.type = type
        this.x = props.x || 0
        this.y = props.y || 0
        this.fill = props.fill || 'transparent'
        this.stroke = props.stroke || '#000000'
        this.strokeWidth = props.strokeWidth || 2
        this.opacity = props.opacity || 1
        this.rotation = props.rotation || 0
        this.handDrawn = props.handDrawn || false
        this.locked = false
        this.visible = true
        this.name = props.name || type
        this.layerId = props.layerId || 'default'
    }

    getBounds() {
        return { x: this.x, y: this.y, width: 0, height: 0 }
    }

    containsPoint(x, y) {
        const b = this.getBounds()
        return pointInRect(x, y, b.x, b.y, b.width, b.height)
    }

    serialize() {
        return { ...this }
    }

    clone() {
        const data = this.serialize()
        data.id = generateId()
        return data
    }
}
