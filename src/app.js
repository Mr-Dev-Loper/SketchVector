import Toolbar from './components/Toolbar.js'
import PropertiesPanel from './components/PropertiesPanel.js'
import LayersPanel from './components/LayersPanel.js'
import Minimap from './components/Minimap.js'
import Canvas from './canvas/Canvas.js'
import Viewport from './canvas/Viewport.js'
import StateManager from './state/StateManager.js'
import History from './state/History.js'

export default class App {
    constructor() {
        this.container = null
        this.canvas = null
        this.ctx = null
        this.stateManager = null
        this.history = null
        this.toolbar = null
        this.propertiesPanel = null
        this.layersPanel = null
        this.minimap = null
        this.viewport = null
    }

    init() {
        this.container = document.getElementById('app-container') || document.body

        this.stateManager = new StateManager()
        this.history = new History()

        this.viewport = new Viewport()
        this._setupCanvas()
        this._setupUI()
        this._bindEvents()
        this._updateUI()

        console.log('SketchVector initialized')
    }

    _setupCanvas() {
        this.canvas = document.getElementById('canvas')
        if (!this.canvas) {
            this.canvas = document.createElement('canvas')
            this.canvas.id = 'canvas'
            document.body.appendChild(this.canvas)
        }
        this.ctx = this.canvas.getContext('2d')
        this._resizeCanvas()
        window.addEventListener('resize', () => {
            this._resizeCanvas()
            this._updateMinimap()
        })
    }

    _resizeCanvas() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
    }

    _setupUI() {
        this.toolbar = new Toolbar({
            activeTool: this.stateManager.getState().activeTool,
            onToolSelect: (tool) => this._onToolSelect(tool),
            onUndo: () => this._onUndo(),
            onRedo: () => this._onRedo(),
            onZoomIn: () => this._onZoomIn(),
            onZoomOut: () => this._onZoomOut(),
            onZoomFit: () => this._onZoomFit(),
            onExport: (format) => this._onExport(format)
        })
        this.toolbar.mount(document.body)

        this.propertiesPanel = new PropertiesPanel({
            state: this.stateManager.getState(),
            onChange: (prop, val) => this._onPropertyChange(prop, val)
        })
        this.propertiesPanel.mount(document.body)

        this.layersPanel = new LayersPanel({
            shapes: this.stateManager.getState().shapes,
            layers: this.stateManager.getState().layers,
            selectedIds: this.stateManager.getState().selectedIds,
            onSelect: (id) => this._onLayerSelect(id),
            onToggleVisibility: (id) => this._onToggleVisibility(id),
            onToggleLock: (id) => this._onToggleLock(id),
            onDelete: (id) => this._onDeleteShape(id),
            onAddLayer: () => this._onAddLayer(),
            onOpacityChange: (opacity) => this._onPropertyChange('opacity', opacity)
        })
        this.layersPanel.mount(document.body)

        this.minimap = new Minimap({
            shapes: this.stateManager.getState().shapes,
            viewport: this.viewport.getTransform(),
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height,
            onClick: (x, y) => this._onMinimapClick(x, y)
        })
        this.minimap.mount(document.body)
    }

    _bindEvents() {
        this.stateManager.subscribe(() => this._updateUI())

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault()
            if (e.deltaY < 0) this._onZoomIn()
            else this._onZoomOut()
        })

        document.addEventListener('keydown', (e) => this._onKeyDown(e))
    }

    _updateUI() {
        const state = this.stateManager.getState()
        this.toolbar.setActiveTool(state.activeTool)
        this.toolbar.setHistoryState(this.history.canUndo(), this.history.canRedo())
        this.propertiesPanel.updateState(state)

        const selectedShape = state.selectedIds.length === 1
            ? state.shapes.find(s => s.id === state.selectedIds[0])
            : null
        if (selectedShape) {
            this.propertiesPanel.updateState({
                fill: selectedShape.fill,
                stroke: selectedShape.stroke,
                strokeWidth: selectedShape.strokeWidth,
                opacity: selectedShape.opacity,
                handDrawn: selectedShape.handDrawn,
                x: selectedShape.x,
                y: selectedShape.y,
                width: selectedShape.width || 0,
                height: selectedShape.height || 0,
                fontSize: selectedShape.fontSize || 16
            })
        }

        this.layersPanel.update(state.shapes, state.layers, state.selectedIds)
        this._updateMinimap()
        this._drawCanvas()
    }

    _updateMinimap() {
        this.minimap.update(
            this.stateManager.getState().shapes,
            this.viewport.getTransform(),
            this.canvas.width,
            this.canvas.height
        )
    }

    _drawCanvas() {
        const state = this.stateManager.getState()
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.save()
        this.viewport.applyTransform(this.ctx)

        for (const shape of state.shapes) {
            if (shape.visible === false) continue
            this._drawShape(shape, state.selectedIds.includes(shape.id))
        }

        this.ctx.restore()
    }

    _drawShape(shape, selected) {
        const ctx = this.ctx
        ctx.globalAlpha = shape.opacity ?? 1
        ctx.lineWidth = shape.strokeWidth || 2

        if (shape.fill && shape.fill !== 'transparent') {
            ctx.fillStyle = shape.fill
        }
        ctx.strokeStyle = shape.stroke || '#000'

        switch (shape.type) {
            case 'rect':
                if (shape.fill && shape.fill !== 'transparent') ctx.fillRect(shape.x, shape.y, shape.width, shape.height)
                ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
                break
            case 'circle':
                ctx.beginPath()
                ctx.arc(shape.x, shape.y, shape.radius || 20, 0, Math.PI * 2)
                if (shape.fill && shape.fill !== 'transparent') ctx.fill()
                ctx.stroke()
                break
            case 'line':
                ctx.beginPath()
                ctx.moveTo(shape.startX, shape.startY)
                ctx.lineTo(shape.endX, shape.endY)
                ctx.stroke()
                break
            case 'path':
                if (shape.points && shape.points.length > 1) {
                    ctx.beginPath()
                    ctx.moveTo(shape.points[0].x, shape.points[0].y)
                    for (let i = 1; i < shape.points.length; i++) {
                        ctx.lineTo(shape.points[i].x, shape.points[i].y)
                    }
                    ctx.stroke()
                }
                break
            case 'text':
                ctx.font = `${shape.fontSize || 16}px sans-serif`
                ctx.fillStyle = shape.stroke || '#000'
                ctx.fillText(shape.text || '', shape.x, shape.y)
                break
        }

        if (selected) {
            const b = this._getShapeBounds(shape)
            if (b) {
                ctx.setLineDash([4, 4])
                ctx.strokeStyle = '#4a86e8'
                ctx.lineWidth = 1 / this.viewport.zoom
                ctx.strokeRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8)
                ctx.setLineDash([])
            }
        }

        ctx.globalAlpha = 1
    }

    _getShapeBounds(shape) {
        switch (shape.type) {
            case 'rect': return { x: shape.x, y: shape.y, w: shape.width, h: shape.height }
            case 'circle': return { x: shape.x - (shape.radius || 20), y: shape.y - (shape.radius || 20), w: (shape.radius || 20) * 2, h: (shape.radius || 20) * 2 }
            case 'text': return { x: shape.x, y: shape.y - 20, w: 100, h: 24 }
            default: return null
        }
    }

    _pushHistory() {
        this.history.push(this.stateManager.getState())
    }

    _onToolSelect(tool) {
        this.stateManager.setState({ activeTool: tool })
    }

    _onPropertyChange(prop, val) {
        const state = this.stateManager.getState()
        if (['fill', 'stroke', 'strokeWidth', 'opacity', 'handDrawn', 'fontSize'].includes(prop)) {
            this.stateManager.setState({ [prop]: val })
        }
        if (state.selectedIds.length > 0) {
            this._pushHistory()
            const shapes = state.shapes.map(s => {
                if (state.selectedIds.includes(s.id)) {
                    return { ...s, [prop]: val }
                }
                return s
            })
            this.stateManager.setState({ shapes })
        }
    }

    _onLayerSelect(id) {
        this.stateManager.setState({ selectedIds: [id] })
    }

    _onToggleVisibility(id) {
        const state = this.stateManager.getState()
        const shapes = state.shapes.map(s => {
            if (s.id === id) return { ...s, visible: !s.visible }
            return s
        })
        this.stateManager.setState({ shapes })
    }

    _onToggleLock(id) {
        const state = this.stateManager.getState()
        const shapes = state.shapes.map(s => {
            if (s.id === id) return { ...s, locked: !s.locked }
            return s
        })
        this.stateManager.setState({ shapes })
    }

    _onDeleteShape(id) {
        this._pushHistory()
        const state = this.stateManager.getState()
        this.stateManager.setState({
            shapes: state.shapes.filter(s => s.id !== id),
            selectedIds: state.selectedIds.filter(sid => sid !== id)
        })
    }

    _onAddLayer() {
        const state = this.stateManager.getState()
        const layerNum = state.layers.length + 1
        this.stateManager.setState({
            layers: [...state.layers, { id: `layer-${layerNum}`, name: `Layer ${layerNum}`, visible: true, locked: false }]
        })
    }

    _onUndo() {
        const prevState = this.history.undo()
        if (prevState) {
            this.stateManager.setState(prevState)
        }
    }

    _onRedo() {
        const nextState = this.history.redo()
        if (nextState) {
            this.stateManager.setState(nextState)
        }
    }

    _onZoomIn() {
        this.viewport.zoom(1, this.canvas.width / 2, this.canvas.height / 2)
        this._drawCanvas()
        this._updateMinimap()
    }

    _onZoomOut() {
        this.viewport.zoom(-1, this.canvas.width / 2, this.canvas.height / 2)
        this._drawCanvas()
        this._updateMinimap()
    }

    _onZoomFit() {
        const state = this.stateManager.getState()
        let bounds = null
        if (state.shapes.length > 0) {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
            for (const s of state.shapes) {
                if (s.type === 'rect') {
                    minX = Math.min(minX, s.x); minY = Math.min(minY, s.y)
                    maxX = Math.max(maxX, s.x + s.width); maxY = Math.max(maxY, s.y + s.height)
                } else if (s.type === 'circle') {
                    minX = Math.min(minX, s.x - 20); minY = Math.min(minY, s.y - 20)
                    maxX = Math.max(maxX, s.x + 20); maxY = Math.max(maxY, s.y + 20)
                }
            }
            bounds = { minX, minY, maxX, maxY }
        }
        this.viewport.fitToScreen(this.canvas.width, this.canvas.height, bounds)
        this._drawCanvas()
        this._updateMinimap()
    }

    _onMinimapClick(x, y) {
        this.viewport.x = x - this.canvas.width / 2
        this.viewport.y = y - this.canvas.height / 2
        this._drawCanvas()
        this._updateMinimap()
    }

    _onExport(format) {
        console.log('Export as', format)
    }

    _onKeyDown(e) {
        if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
            e.preventDefault()
            this._onRedo()
        } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            this._onUndo()
        }
    }
}
