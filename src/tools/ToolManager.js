import PenTool from './PenTool.js'
import ShapeTool from './ShapeTool.js'
import TextTool from './TextTool.js'
import EraserTool from './EraserTool.js'
import SelectionTool from './SelectionTool.js'

const TOOL_CURSORS = {
    select: 'default',
    pen: 'crosshair',
    highlighter: 'crosshair',
    rect: 'crosshair',
    circle: 'crosshair',
    line: 'crosshair',
    arrow: 'crosshair',
    diamond: 'crosshair',
    text: 'text',
    eraser: 'crosshair'
}

export default class ToolManager {
    constructor(canvas, stateManager, viewport, history) {
        this.canvas = canvas
        this.state = stateManager
        this.viewport = viewport
        this.history = history
        this.tools = {}
        this.activeTool = null
        this.activeToolName = null

        if (canvas && stateManager && viewport && history) {
            this._registerTools()
            this._bindCanvasEvents()
            this.setTool('select')
        }
    }

    _registerTools() {
        this.tools.pen = new PenTool(this)
        this.tools.rect = new ShapeTool(this, 'rect')
        this.tools.circle = new ShapeTool(this, 'circle')
        this.tools.line = new ShapeTool(this, 'line')
        this.tools.arrow = new ShapeTool(this, 'arrow')
        this.tools.diamond = new ShapeTool(this, 'diamond')
        this.tools.text = new TextTool(this)
        this.tools.eraser = new EraserTool(this)
        this.tools.select = new SelectionTool(this)
    }

    _bindCanvasEvents() {
        if (!this.canvas) return
        this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e))
        this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e))
        this.canvas.addEventListener('mouseup', (e) => this._onMouseUp(e))
        this.canvas.addEventListener('dblclick', (e) => this._onDblClick(e))
    }

    setTool(name) {
        if (this.activeTool && this.activeTool.deactivate) {
            this.activeTool.deactivate()
        }
        this.activeToolName = name
        this.activeTool = this.tools[name] || null
        if (this.activeTool && this.activeTool.activate) {
            this.activeTool.activate()
        }
        if (this.canvas) {
            this.canvas.style.cursor = TOOL_CURSORS[name] || 'default'
        }
        if (this.state) {
            this.state.setState({ activeTool: name })
        }
    }

    getTool(name) {
        return this.tools[name]
    }

    getActiveToolName() {
        return this.activeToolName
    }

    _getEventPos(e) {
        if (!this.viewport) return { x: e.clientX, y: e.clientY }
        return this.viewport.screenToWorld(e.clientX, e.clientY)
    }

    _onMouseDown(e) {
        if (!this.activeTool || !this.activeTool.handleMouseDown) return
        const pos = this._getEventPos(e)
        this.activeTool.handleMouseDown(pos, e)
    }

    _onMouseMove(e) {
        if (!this.activeTool || !this.activeTool.handleMouseMove) return
        const pos = this._getEventPos(e)
        this.activeTool.handleMouseMove(pos, e)
    }

    _onMouseUp(e) {
        if (!this.activeTool || !this.activeTool.handleMouseUp) return
        const pos = this._getEventPos(e)
        this.activeTool.handleMouseUp(pos, e)
    }

    _onDblClick(e) {
        if (!this.activeTool || !this.activeTool.handleDblClick) return
        const pos = this._getEventPos(e)
        this.activeTool.handleDblClick(pos, e)
    }

    handleKeyDown(e) {
        if (this.activeTool && this.activeTool.handleKeyDown) {
            this.activeTool.handleKeyDown(e)
        }
    }

    pushHistory() {
        if (this.history && this.state) {
            this.history.push(this.state.getState())
        }
    }

    getCanvas() {
        return this.canvas
    }

    getCtx() {
        return this.canvas ? this.canvas.getContext('2d') : null
    }

    redraw() {
        if (this.canvas) {
            this.canvas.dispatchEvent(new CustomEvent('redraw'))
        }
    }
}
