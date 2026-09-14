import Viewport from './canvas/Viewport.js'
import Renderer from './canvas/Renderer.js'
import ToolManager from './tools/ToolManager.js'
import PenTool from './tools/PenTool.js'
import ShapeTool from './tools/ShapeTool.js'
import TextTool from './tools/TextTool.js'
import EraserTool from './tools/EraserTool.js'
import SelectionTool from './tools/SelectionTool.js'
import StateManager from './state/StateManager.js'
import History from './state/History.js'
import Storage from './state/Storage.js'
import Toolbar from './components/Toolbar.js'
import PropertiesPanel from './components/PropertiesPanel.js'
import LayersPanel from './components/LayersPanel.js'
import Minimap from './components/Minimap.js'
import { ThemeManager } from './utils/theme.js'
import Grid from './utils/grid.js'
import Exporter from './utils/export.js'
import ContextMenu from './components/ContextMenu.js'

export default class App {
    constructor() {
        this.state = null
        this.history = null
        this.storage = null
        this.viewport = null
        this.canvas = null
        this.ctx = null
        this.renderer = null
        this.toolManager = null
        this.toolbar = null
        this.propertiesPanel = null
        this.layersPanel = null
        this.minimap = null
        this.isPanning = false
        this.panStart = null
        this.grid = null
        this.contextMenu = null
        this.clipboard = null
        this.themeManager = null
    }

    init() {
        this.container = document.getElementById('app-container') || document.body
        this.themeManager = new ThemeManager()

        this.state = new StateManager()
        this.history = new History()
        this.storage = new Storage()
        this.viewport = new Viewport()
        this.grid = new Grid(this.viewport)
        this.contextMenu = new ContextMenu(this)

        this._setupCanvas()
        this.renderer = new Renderer(this.canvas)
        this.toolManager = new ToolManager(this.canvas, this.state, this.viewport, this.history)
        this._setupUI()
        this._bindEvents()
        this._loadSavedState()
        this._drawCanvas()

        console.log('SketchVector initialized')
    }

    _setupCanvas() {
        this.canvas = document.getElementById('canvas')
        if (!this.canvas) {
            this.canvas = document.createElement('canvas')
            this.canvas.id = 'canvas'
            this.container.appendChild(this.canvas)
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
        const state = this.state.getState()

        this.toolbar = new Toolbar({
            activeTool: state.activeTool,
            onToolSelect: (tool) => this._onToolSelect(tool),
            onUndo: () => this._onUndo(),
            onRedo: () => this._onRedo(),
            onZoomIn: () => this._onZoomIn(),
            onZoomOut: () => this._onZoomOut(),
            onZoomFit: () => this._onZoomFit(),
            onExport: (format) => this._onExport(format)
        })
        this.toolbar.mount(this.container)

        this.propertiesPanel = new PropertiesPanel({
            state: state,
            onChange: (prop, val) => this._onPropertyChange(prop, val)
        })
        this.propertiesPanel.mount(this.container)

        this.layersPanel = new LayersPanel({
            shapes: state.shapes,
            layers: state.layers,
            selectedIds: state.selectedIds,
            onSelect: (id) => this._onLayerSelect(id),
            onToggleVisibility: (id) => this._onToggleVisibility(id),
            onToggleLock: (id) => this._onToggleLock(id),
            onDelete: (id) => this._onDeleteShape(id),
            onAddLayer: () => this._onAddLayer(),
            onOpacityChange: (opacity) => this._onPropertyChange('opacity', opacity)
        })
        this.layersPanel.mount(this.container)

        this.minimap = new Minimap({
            shapes: state.shapes,
            viewport: this.viewport.getTransform(),
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height,
            onClick: (x, y) => this._onMinimapClick(x, y)
        })
        this.minimap.mount(this.container)
    }

    _bindEvents() {
        this.state.subscribe(() => this._updateUI())

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault()
            const delta = e.deltaY > 0 ? -0.1 : 0.1
            this.viewport.zoom(delta, e.clientX, e.clientY)
            this._drawCanvas()
            this._updateMinimap()
        })

        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault()
            this.contextMenu.show(e.clientX, e.clientY)
        })

        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 1 || (e.button === 0 && e.shiftKey && !this.toolManager.activeToolName?.includes('select'))) {
                this.isPanning = true
                this.panStart = { x: e.clientX, y: e.clientY }
                this.canvas.style.cursor = 'grabbing'
                e.preventDefault()
            }
        })

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isPanning && this.panStart) {
                const dx = e.clientX - this.panStart.x
                const dy = e.clientY - this.panStart.y
                this.viewport.pan(dx, dy)
                this.panStart = { x: e.clientX, y: e.clientY }
                this._drawCanvas()
                this._updateMinimap()
            }
        })

        this.canvas.addEventListener('mouseup', (e) => {
            if (this.isPanning) {
                this.isPanning = false
                this.panStart = null
                if (this.toolManager) {
                    this.canvas.style.cursor = ''
                }
            }
        })

        this.canvas.addEventListener('redraw', () => {
            this._drawCanvas()
        })

        document.addEventListener('keydown', (e) => this._onKeyDown(e))
        window.addEventListener('resize', () => this._onResize())

        document.addEventListener('tool-select', (e) => {
            this.toolManager.setTool(e.detail.tool)
        })

        this._autoSaveInterval = setInterval(() => this._autoSave(), 30000)
    }

    _updateUI() {
        const state = this.state.getState()
        if (this.toolbar.activeTool !== state.activeTool) {
            this.toolbar.setActiveTool(state.activeTool)
        }
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
            this.state.getState().shapes,
            this.viewport.getTransform(),
            this.canvas.width,
            this.canvas.height
        )
    }

    _drawCanvas() {
        const state = this.state.getState()
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.save()
        this.viewport.applyTransform(this.ctx)

        this.grid.render(this.ctx, this.canvas.width, this.canvas.height)

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
                if (shape.isDiamond || shape._diamond) {
                    ctx.beginPath()
                    const cx = shape.x + shape.width / 2
                    const cy = shape.y + shape.height / 2
                    ctx.moveTo(cx, shape.y)
                    ctx.lineTo(shape.x + shape.width, cy)
                    ctx.lineTo(cx, shape.y + shape.height)
                    ctx.lineTo(shape.x, cy)
                    ctx.closePath()
                    if (shape.fill && shape.fill !== 'transparent') ctx.fill()
                    ctx.stroke()
                } else {
                    if (shape.fill && shape.fill !== 'transparent') ctx.fillRect(shape.x, shape.y, shape.width, shape.height)
                    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
                }
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
            case 'arrow':
                this._drawArrow(ctx, shape.startX, shape.startY, shape.endX, shape.endY)
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
                ctx.font = `${shape.fontSize || 16}px ${shape.fontFamily || 'sans-serif'}`
                ctx.fillStyle = shape.stroke || '#000'
                ctx.fillText(shape.text || '', shape.x, shape.y)
                break
        }

        if (selected) {
            const b = this._getShapeBounds(shape)
            if (b) {
                ctx.setLineDash([4, 4])
                ctx.strokeStyle = '#4a86e8'
                ctx.lineWidth = 1 / this.viewport.zoomLevel
                ctx.strokeRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8)
                ctx.setLineDash([])
            }
        }

        ctx.globalAlpha = 1
    }

    _drawArrow(ctx, x1, y1, x2, y2) {
        const headLength = 15
        const dx = x2 - x1
        const dy = y2 - y1
        const angle = Math.atan2(dy, dx)
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x2, y2)
        ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6))
        ctx.moveTo(x2, y2)
        ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6))
        ctx.stroke()
    }

    _getShapeBounds(shape) {
        switch (shape.type) {
            case 'rect':
                return { x: shape.x, y: shape.y, w: shape.width, h: shape.height }
            case 'circle':
                return { x: shape.x - (shape.radius || 20), y: shape.y - (shape.radius || 20), w: (shape.radius || 20) * 2, h: (shape.radius || 20) * 2 }
            case 'text':
                return { x: shape.x, y: shape.y - 20, w: 100, h: 24 }
            default:
                return null
        }
    }

    _pushHistory() {
        this.history.push(this.state.getState())
    }

    _onToolSelect(tool) {
        this.state.setState({ activeTool: tool })
    }

    _onPropertyChange(prop, val) {
        const state = this.state.getState()
        if (['fill', 'stroke', 'strokeWidth', 'opacity', 'handDrawn', 'fontSize'].includes(prop)) {
            this.state.setState({ [prop]: val })
        }
        if (state.selectedIds.length > 0) {
            this._pushHistory()
            const shapes = state.shapes.map(s => {
                if (state.selectedIds.includes(s.id)) {
                    return { ...s, [prop]: val }
                }
                return s
            })
            this.state.setState({ shapes })
        }
    }

    _onLayerSelect(id) {
        this.state.setState({ selectedIds: [id] })
    }

    _onToggleVisibility(id) {
        const state = this.state.getState()
        const shapes = state.shapes.map(s => {
            if (s.id === id) return { ...s, visible: !s.visible }
            return s
        })
        this.state.setState({ shapes })
    }

    _onToggleLock(id) {
        const state = this.state.getState()
        const shapes = state.shapes.map(s => {
            if (s.id === id) return { ...s, locked: !s.locked }
            return s
        })
        this.state.setState({ shapes })
    }

    _onDeleteShape(id) {
        this._pushHistory()
        const state = this.state.getState()
        this.state.setState({
            shapes: state.shapes.filter(s => s.id !== id),
            selectedIds: state.selectedIds.filter(sid => sid !== id)
        })
    }

    _onAddLayer() {
        const state = this.state.getState()
        const layerNum = state.layers.length + 1
        this.state.setState({
            layers: [...state.layers, { id: `layer-${layerNum}`, name: `Layer ${layerNum}`, visible: true, locked: false }]
        })
    }

    _onUndo() {
        const currentState = this.state.getState()
        const prevState = this.history.undo(currentState)
        if (prevState) {
            this.state.setState(prevState)
        }
    }

    _onRedo() {
        const currentState = this.state.getState()
        const nextState = this.history.redo(currentState)
        if (nextState) {
            this.state.setState(nextState)
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
        const state = this.state.getState()
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
        const state = this.state.getState()
        switch (format) {
            case 'png':
                Exporter.exportToPNG(this.canvas, state.shapes, this.viewport)
                break
            case 'svg':
                Exporter.exportToSVG(state.shapes, this.viewport)
                break
            case 'json':
                Exporter.exportToJSON(state)
                break
        }
    }

    _cutShapes() {
        this._copyShapes()
        this._deleteSelected()
    }

    _copyShapes() {
        const state = this.state.getState()
        const selected = state.shapes.filter(s => state.selectedIds.includes(s.id))
        this.clipboard = JSON.parse(JSON.stringify(selected))
    }

    _pasteShapes() {
        if (!this.clipboard || this.clipboard.length === 0) return
        this._pushHistory()
        const state = this.state.getState()
        const offset = 20
        const newShapes = this.clipboard.map(s => ({
            ...s,
            id: `paste-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            x: (s.x || 0) + offset,
            y: (s.y || 0) + offset,
            startX: s.startX !== undefined ? s.startX + offset : undefined,
            startY: s.startY !== undefined ? s.startY + offset : undefined,
            endX: s.endX !== undefined ? s.endX + offset : undefined,
            endY: s.endY !== undefined ? s.endY + offset : undefined
        }))
        this.state.setState({
            shapes: [...state.shapes, ...newShapes],
            selectedIds: newShapes.map(s => s.id)
        })
    }

    _deleteSelected() {
        const state = this.state.getState()
        if (state.selectedIds.length === 0) return
        this._pushHistory()
        this.state.setState({
            shapes: state.shapes.filter(s => !state.selectedIds.includes(s.id)),
            selectedIds: []
        })
    }

    _selectAll() {
        const state = this.state.getState()
        this.state.setState({
            selectedIds: state.shapes.map(s => s.id)
        })
    }

    _onResize() {
        this._resizeCanvas()
        this._updateMinimap()
        this._drawCanvas()
    }

    _onKeyDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

        if (this.toolManager?.activeTool?.handleKeyDown) {
            this.toolManager.activeTool.handleKeyDown(e)
        }

        if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
            e.preventDefault()
            this._onUndo()
        }
        if ((e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) || (e.key === 'y' && (e.ctrlKey || e.metaKey))) {
            e.preventDefault()
            this._onRedo()
        }
        if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            this._saveProject()
        }

        const shortcuts = {
            'v': 'select', 'p': 'pen', 'h': 'highlighter', 'e': 'eraser',
            'r': 'rect', 'c': 'circle', 'l': 'line', 'a': 'arrow',
            'd': 'diamond', 't': 'text'
        }
        if (shortcuts[e.key] && !e.ctrlKey && !e.metaKey) {
            this.state.setState({ activeTool: shortcuts[e.key] })
            this.toolbar.setActiveTool(shortcuts[e.key])
        }

        if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
            this.grid.toggle()
            this._drawCanvas()
        }

        if (e.key === 'T' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
            e.preventDefault()
            this.themeManager.toggle()
            this._drawCanvas()
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                this._deleteSelected()
            }
        }
        if (e.key === ' ') {
            e.preventDefault()
            this.canvas.style.cursor = 'grab'
        }
    }

    _saveProject() {
        const state = this.state.getState()
        const name = prompt('Enter project name:', 'my-whiteboard')
        if (name) {
            this.storage.saveProject(name, state)
            console.log('Project saved:', name)
        }
    }

    _autoSave() {
        this.storage.autoSave(this.state.getState())
    }

    _loadSavedState() {
        const autoSaved = this.storage.loadAutoSave()
        if (autoSaved) {
            this.state.setState(autoSaved)
        }
    }
}
