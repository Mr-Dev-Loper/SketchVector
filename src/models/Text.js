import Shape from './Shape.js'

export default class Text extends Shape {
    constructor(props = {}) {
        super('text', props)
        this.text = props.text || ''
        this.fontSize = props.fontSize || 16
        this.fontFamily = props.fontFamily || 'sans-serif'
        this.width = props.width || 200
        this.height = props.height || 50
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height }
    }

    serialize() {
        return { ...this }
    }

    clone() {
        const data = this.serialize()
        data.id = undefined
        const copy = new Text(data)
        return copy
    }
}
