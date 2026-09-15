import PenTool from './PenTool.js'
import ShapeTool from './ShapeTool.js'
import TextTool from './TextTool.js'
import EraserTool from './EraserTool.js'
import SelectionTool from './SelectionTool.js'

export default class ToolManager {
    constructor(canvas, state, viewport, history) {
        this.canvas = canvas
        this.state = state
        this.viewport = viewport
        this.history = history
        this.tools = {}
        this.activeTool = null
        this.activeToolName = null
        this._registerTools()
        this._bindCanvasEvents()
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
        this.tools.hand = {
            activate: () => { this.canvas.style.cursor = 'grab' },
            deactivate: () => {},
        }
    }

    _bindCanvasEvents() {
        this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e))
        this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e))
        this.canvas.addEventListener('mouseup', (e) => this._onMouseUp(e))
        this.canvas.addEventListener('dblclick', (e) => this._onDblClick(e))
    }

    setTool(name) {
        if (this.activeTool?.deactivate) this.activeTool.deactivate()
        this.activeToolName = name
        this.activeTool = this.tools[name] || null
        if (this.activeTool?.activate) this.activeTool.activate()
    }

    _getPos(e) {
        return this.viewport.screenToWorld(e.clientX, e.clientY)
    }

    _onMouseDown(e) {
        if (this.activeToolName === 'hand') return
        if (!this.activeTool?.handleMouseDown) return
        if (e.button === 1) return
        this.activeTool.handleMouseDown(this._getPos(e), e)
    }

    _onMouseMove(e) {
        if (this.activeToolName === 'hand') return
        if (!this.activeTool?.handleMouseMove) return
        this.activeTool.handleMouseMove(this._getPos(e), e)
    }

    _onMouseUp(e) {
        if (this.activeToolName === 'hand') return
        if (!this.activeTool?.handleMouseUp) return
        this.activeTool.handleMouseUp(this._getPos(e), e)
    }

    _onDblClick(e) {
        if (this.activeToolName === 'hand') return
        if (!this.activeTool?.handleDblClick) return
        this.activeTool.handleDblClick(this._getPos(e), e)
    }

    handleKeyDown(e) {
        if (this.activeTool?.handleKeyDown) this.activeTool.handleKeyDown(e)
    }

    pushHistory() {
        this.history.push(this.state.getState())
    }

    redraw() {
        this.canvas.dispatchEvent(new CustomEvent('redraw'))
    }

    getCtx() {
        return this.canvas.getContext('2d')
    }

    getPreview() {
        if (this.activeTool?.preview) return this.activeTool.preview
        if (this.activeTool?.currentPath) return this.activeTool.currentPath
        if (this.activeTool?.marquee) return this.activeTool.marquee
        return null
    }

    drawResizeHandles(shape) {
        const tool = this.tools['select']
        if (tool && tool._drawResizeHandles) tool._drawResizeHandles(shape)
    }
}
