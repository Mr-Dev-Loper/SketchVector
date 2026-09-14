export default class App {
    constructor() {
        this.canvas = null
        this.ctx = null
    }

    init() {
        this.canvas = document.getElementById('canvas')
        this.ctx = this.canvas.getContext('2d')

        this.resizeCanvas()
        window.addEventListener('resize', () => this.resizeCanvas())

        console.log('SketchVector initialized')
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
    }
}