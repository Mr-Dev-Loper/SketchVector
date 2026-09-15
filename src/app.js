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
import PropertiesBar from './components/PropertiesBar.js'
import BottomBar from './components/BottomBar.js'
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
        this.propertiesBar = null
        this.bottomBar = null
        this.contextMenu = null
        this.isPanning = false
        this.panStart = null
        this.clipboard = null
        this.spaceHeld = false
    }

    init() {
        this.state = new StateManager()
        this.history = new History()
        this.storage = new Storage()
        this.viewport = new Viewport()

        this.canvas = document.getElementById('canvas')
        this.ctx = this.canvas.getContext('2d')
        this._resizeCanvas()

        this.renderer = new Renderer(this.canvas)
        this.toolManager = new ToolManager(this.canvas, this.state, this.viewport, this.history)

        this._setupUI()
        this._bindEvents()
        this._loadSavedState()
        this._drawCanvas()
        this._hideHelpHint()
        this._setupContextMenu()

        console.log('SketchVector ready')
    }

    _resizeCanvas() {
        const dpr = window.devicePixelRatio || 1
        this.canvas.width = window.innerWidth * dpr
        this.canvas.height = window.innerHeight * dpr
        this.canvas.style.width = window.innerWidth + 'px'
        this.canvas.style.height = window.innerHeight + 'px'
        this.ctx.scale(dpr, dpr)
    }

    _setupUI() {
        const state = this.state.getState()

        this.toolbar = new Toolbar({
            activeTool: state.activeTool,
            onToolSelect: (tool) => this._onToolSelect(tool),
            onExport: (format) => this._onExport(format),
            onImport: () => this._onImport(),
        })
        this.toolbar.mount(document.getElementById('app'))

        this.propertiesBar = new PropertiesBar({
            onChange: (prop, val) => this._onPropertyChange(prop, val),
            onLayerAction: (action) => this._onLayerAction(action),
            onDelete: () => this._deleteSelected(),
        })
        this.propertiesBar.mount(document.getElementById('app'))

        this.bottomBar = new BottomBar({
            onUndo: () => this._onUndo(),
            onRedo: () => this._onRedo(),
            onZoomIn: () => this._onZoomIn(),
            onZoomOut: () => this._onZoomOut(),
            onZoomReset: () => this._onZoomFit(),
            getZoom: () => this.viewport.zoomLevel,
        })
        this.bottomBar.mount(document.getElementById('app'))
        this.bottomBar.updateZoom(this.viewport.zoomLevel, this.viewport.getDisplayZoom())
    }

    _bindEvents() {
        window.addEventListener('resize', () => {
            this._resizeCanvas()
            this._drawCanvas()
        })

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault()
            const delta = e.deltaY > 0 ? -0.1 : 0.1
            this.viewport.zoom(delta, e.clientX, e.clientY)
            this.bottomBar.updateZoom(this.viewport.zoomLevel, this.viewport.getDisplayZoom())
            this._drawCanvas()
        }, { passive: false })

        this.canvas.addEventListener('mousedown', (e) => {
            const isHandTool = this.state.getState().activeTool === 'hand'
            if (e.button === 1 || this.spaceHeld || isHandTool) {
                this.isPanning = true
                this.panStart = { x: e.clientX, y: e.clientY }
                this.canvas.style.cursor = 'grabbing'
                e.preventDefault()
                return
            }
        })

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isPanning && this.panStart) {
                const dx = e.clientX - this.panStart.x
                const dy = e.clientY - this.panStart.y
                this.viewport.pan(dx, dy)
                this.panStart = { x: e.clientX, y: e.clientY }
                this._drawCanvas()
            }
        })

        this.canvas.addEventListener('mouseup', () => {
            if (this.isPanning) {
                this.isPanning = false
                this.panStart = null
                this.canvas.style.cursor = this.spaceHeld ? 'grab' : this._getCursorForTool()
            }
        })

        this.canvas.addEventListener('redraw', () => this._drawCanvas())

        document.addEventListener('keydown', (e) => this._onKeyDown(e))
        document.addEventListener('keyup', (e) => this._onKeyUp(e))
    }

    _onKeyDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

        if (e.key === ' ') {
            e.preventDefault()
            this.spaceHeld = true
            this.canvas.style.cursor = 'grab'
            return
        }

        if (this.toolManager?.activeTool?.handleKeyDown) {
            this.toolManager.activeTool.handleKeyDown(e)
        }

        const ctrl = e.ctrlKey || e.metaKey

        if (e.key === 'z' && ctrl && !e.shiftKey) { e.preventDefault(); this._onUndo() }
        if ((e.key === 'z' && ctrl && e.shiftKey) || (e.key === 'y' && ctrl)) { e.preventDefault(); this._onRedo() }
        if (e.key === 's' && ctrl) { e.preventDefault(); this._saveProject() }

        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                this._deleteSelected()
            }
        }

        if (e.key === 'c' && ctrl) this._copyShapes()
        if (e.key === 'v' && ctrl) this._pasteShapes()
        if (e.key === 'x' && ctrl) { this._copyShapes(); this._deleteSelected() }
        if (e.key === 'a' && ctrl) { e.preventDefault(); this._selectAll() }

        const shortcuts = {
            'v': 'select', 'p': 'pen', 'h': 'hand', 'e': 'eraser',
            'r': 'rect', 'o': 'circle', 'l': 'line', 'a': 'arrow',
            'd': 'diamond', 't': 'text'
        }
        if (shortcuts[e.key] && !ctrl) {
            this._onToolSelect(shortcuts[e.key])
            this.toolbar.setActiveTool(shortcuts[e.key])
        }
    }

    _onKeyUp(e) {
        if (e.key === ' ') {
            this.spaceHeld = false
            if (!this.isPanning) this.canvas.style.cursor = ''
        }
    }

    _onToolSelect(tool) {
        this.state.setState({ activeTool: tool })
        this.toolManager.setTool(tool)
        const state = this.state.getState()
        if (state.selectedIds.length === 0) {
            const showTools = ['rect', 'circle', 'diamond', 'line', 'arrow', 'pen', 'text']
            if (showTools.includes(tool)) {
                this.propertiesBar.showForTool(tool, {
                    stroke: state.stroke || '#1e1e1e',
                    fill: state.fill || 'transparent',
                    strokeWidth: state.strokeWidth || 2,
                    strokeStyle: state.strokeStyle || 'solid',
                    edges: state.edges || 'sharp',
                    opacity: state.opacity !== undefined ? state.opacity : 1,
                    fontFamily: state.fontFamily || "'Excalifont', cursive",
                    fontSize: state.fontSize || 20,
                    textAlign: state.textAlign || 'left',
                })
            } else {
                this.propertiesBar.hide()
            }
        }
        this._drawCanvas()
    }

    _onPropertyChange(prop, val) {
        const state = this.state.getState()
        this.state.setState({ [prop]: val })
        if (state.selectedIds.length > 0) {
            this.history.push(state)
            const shapes = state.shapes.map(s => {
                if (state.selectedIds.includes(s.id)) return { ...s, [prop]: val }
                return s
            })
            this.state.setState({ shapes })
            this._drawCanvas()
            const updated = shapes.find(s => state.selectedIds.includes(s.id))
            if (updated) this.propertiesBar.show(updated)
        }
    }

    _onLayerAction(action) {
        const state = this.state.getState()
        if (!state.selectedIds.length) return
        this.history.push(state)
        const shapes = [...state.shapes]
        const selIds = state.selectedIds
        const selIdxs = shapes.map((s, i) => selIds.includes(s.id) ? i : -1).filter(i => i >= 0)
        if (action === 'toFront') {
            const sel = selIdxs.map(i => shapes[i])
            selIdxs.sort((a, b) => b - a).forEach(i => shapes.splice(i, 1))
            shapes.push(...sel)
        } else if (action === 'toBack') {
            const sel = selIdxs.map(i => shapes[i])
            selIdxs.sort((a, b) => a - b).forEach(i => shapes.splice(i, 1))
            shapes.unshift(...sel)
        } else if (action === 'forward') {
            for (let i = shapes.length - 2; i >= 0; i--) {
                if (selIds.includes(shapes[i].id) && !selIds.includes(shapes[i + 1]?.id)) {
                    ;[shapes[i], shapes[i + 1]] = [shapes[i + 1], shapes[i]]
                }
            }
        } else if (action === 'backward') {
            for (let i = 1; i < shapes.length; i++) {
                if (selIds.includes(shapes[i].id) && !selIds.includes(shapes[i - 1]?.id)) {
                    ;[shapes[i], shapes[i - 1]] = [shapes[i - 1], shapes[i]]
                }
            }
        }
        this.state.setState({ shapes })
        this._drawCanvas()
        const updated = shapes.find(s => selIds.includes(s.id))
        if (updated) this.propertiesBar.show(updated)
    }

    _onUndo() {
        const prev = this.history.undo(this.state.getState())
        if (prev) { this.state.setState(prev); this._drawCanvas() }
    }

    _onRedo() {
        const next = this.history.redo(this.state.getState())
        if (next) { this.state.setState(next); this._drawCanvas() }
    }

    _onZoomIn() {
        this.viewport.zoom(1, window.innerWidth / 2, window.innerHeight / 2)
        this.bottomBar.updateZoom(this.viewport.zoomLevel, this.viewport.getDisplayZoom())
        this._drawCanvas()
    }

    _onZoomOut() {
        this.viewport.zoom(-1, window.innerWidth / 2, window.innerHeight / 2)
        this.bottomBar.updateZoom(this.viewport.zoomLevel, this.viewport.getDisplayZoom())
        this._drawCanvas()
    }

    _onZoomFit() {
        const state = this.state.getState()
        let bounds = null
        if (state.shapes.length > 0) {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
            for (const s of state.shapes) {
                if (s.type === 'rect') {
                    minX = Math.min(minX, s.x); minY = Math.min(minY, s.y)
                    maxX = Math.max(maxX, s.x + (s.width || 0)); maxY = Math.max(maxY, s.y + (s.height || 0))
                } else if (s.type === 'circle') {
                    minX = Math.min(minX, s.x - (s.radius || 20)); minY = Math.min(minY, s.y - (s.radius || 20))
                    maxX = Math.max(maxX, s.x + (s.radius || 20)); maxY = Math.max(maxY, s.y + (s.radius || 20))
                } else if (s.type === 'path' && s.points) {
                    for (const p of s.points) {
                        minX = Math.min(minX, p.x); minY = Math.min(minY, p.y)
                        maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y)
                    }
                } else if (s.type === 'line' || s.type === 'arrow') {
                    minX = Math.min(minX, s.startX, s.endX); minY = Math.min(minY, s.startY, s.endY)
                    maxX = Math.max(maxX, s.startX, s.endX); maxY = Math.max(maxY, s.startY, s.endY)
                } else if (s.type === 'text') {
                    minX = Math.min(minX, s.x); minY = Math.min(minY, s.y - 20)
                    maxX = Math.max(maxX, s.x + (s.width || 100)); maxY = Math.max(maxY, s.y + 20)
                }
            }
            bounds = { minX, minY, maxX, maxY }
        }
        this.viewport.fitToScreen(window.innerWidth, window.innerHeight, bounds)
        this.bottomBar.updateZoom(this.viewport.zoomLevel, this.viewport.getDisplayZoom())
        this._drawCanvas()
    }

    _copyShapes() {
        const state = this.state.getState()
        this.clipboard = JSON.parse(JSON.stringify(state.shapes.filter(s => state.selectedIds.includes(s.id))))
    }

    _pasteShapes() {
        if (!this.clipboard || this.clipboard.length === 0) return
        this.history.push(this.state.getState())
        const state = this.state.getState()
        const newShapes = this.clipboard.map(s => ({
            ...s,
            id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            x: (s.x || 0) + 20, y: (s.y || 0) + 20,
            startX: s.startX != null ? s.startX + 20 : undefined,
            startY: s.startY != null ? s.startY + 20 : undefined,
            endX: s.endX != null ? s.endX + 20 : undefined,
            endY: s.endY != null ? s.endY + 20 : undefined,
            points: s.points ? s.points.map(p => ({ x: p.x + 20, y: p.y + 20 })) : undefined,
        }))
        this.state.setState({
            shapes: [...state.shapes, ...newShapes],
            selectedIds: newShapes.map(s => s.id)
        })
        this._drawCanvas()
    }

    _deleteSelected() {
        const state = this.state.getState()
        if (!state.selectedIds.length) return
        this.history.push(state)
        this.state.setState({
            shapes: state.shapes.filter(s => !state.selectedIds.includes(s.id)),
            selectedIds: []
        })
        this.propertiesBar.hide()
        this._drawCanvas()
    }

    _selectAll() {
        const state = this.state.getState()
        this.state.setState({ selectedIds: state.shapes.map(s => s.id) })
    }

    _saveProject() {
        const name = prompt('Project name:', 'my-whiteboard')
        if (name) this.storage.saveProject(name, this.state.getState())
    }

    _loadSavedState() {
        const saved = this.storage.loadAutoSave()
        if (saved) this.state.setState(saved)
    }

    _hideHelpHint() {
        const hint = document.getElementById('help-hint')
        if (hint) {
            setTimeout(() => hint.classList.add('hidden'), 5000)
        }
    }

    _setupContextMenu() {
        this.contextMenu = new ContextMenu({
            onDuplicate: () => this._duplicateSelected(),
            onCopy: () => this._copyShapes(),
            onPaste: () => this._pasteShapes(),
            onDelete: () => this._deleteSelected(),
            onExport: () => this._onExport('project'),
        })
        this.contextMenu.render()

        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault()
            const pos = this.viewport.screenToWorld(e.clientX, e.clientY)
            const s = this.state.getState()
            const hit = this.toolManager.getActiveTool()?._findAt?.(pos.x, pos.y, s) || this.toolManager.getActiveTool()?._findAt?.(pos.x, pos.y, { shapes: s.shapes }) || null
            if (hit && !s.selectedIds.includes(hit.id)) {
                this.state.setState({ selectedIds: [hit.id] })
                this._drawCanvas()
            }
            this.contextMenu.show(e.clientX, e.clientY)
        })

        document.addEventListener('click', () => { this.contextMenu.hide() })
    }

    _duplicateSelected() {
        const s = this.state.getState()
        if (!s.selectedIds.length) return
        this.history.push(s)
        const sel = s.shapes.filter(sh => s.selectedIds.includes(sh.id))
        const dupes = sel.map(sh => ({
            ...sh,
            id: 's_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            x: (sh.x || 0) + 20,
            y: (sh.y || 0) + 20,
        }))
        this.state.setState({ shapes: [...s.shapes, ...dupes], selectedIds: dupes.map(d => d.id) })
        this._drawCanvas()
    }

    _drawCanvas() {
        const state = this.state.getState()
        const w = window.innerWidth
        const h = window.innerHeight

        this.ctx.clearRect(0, 0, w, h)
        this.ctx.save()
        this.viewport.applyTransform(this.ctx)

        this.renderer.renderGrid(this.viewport, w, h)

        for (const shape of state.shapes) {
            if (shape.visible === false) continue
            this.renderer.renderShape(shape)
        }

        const preview = this.toolManager.getPreview()
        if (preview) {
            this.renderer.renderShape(preview)
        }

        if (state.selectedIds.length > 0) {
            for (const shape of state.shapes) {
                if (state.selectedIds.includes(shape.id)) {
                    this._drawSelectionBox(shape)
                    if (state.activeTool === 'select') {
                        this.toolManager.drawResizeHandles(shape)
                    }
                }
            }
        }

        const marquee = this.toolManager.getPreview()
        if (marquee && marquee.w !== undefined) {
            const ctx = this.ctx
            ctx.save()
            ctx.fillStyle = 'rgba(108, 92, 231, 0.1)'
            ctx.strokeStyle = '#6c5ce7'
            ctx.lineWidth = 1 / this.viewport.zoomLevel
            ctx.setLineDash([4, 4])
            ctx.fillRect(marquee.x, marquee.y, marquee.w, marquee.h)
            ctx.strokeRect(marquee.x, marquee.y, marquee.w, marquee.h)
            ctx.setLineDash([])
            ctx.restore()
        }

        this.ctx.restore()

        this.bottomBar.setHistoryState(this.history.canUndo(), this.history.canRedo())
        this.toolbar.setHistoryState(this.history.canUndo(), this.history.canRedo())

        if (state.selectedIds.length > 0) {
            const sel = state.shapes.find(s => s.id === state.selectedIds[0])
            if (sel) this.propertiesBar.show(sel)
        } else if (state.activeTool === 'select' || state.activeTool === 'hand' || state.activeTool === 'eraser') {
            this.propertiesBar.hide()
        }
    }

    _drawSelectionBox(shape) {
        const ctx = this.ctx
        const b = this._getShapeBounds(shape)
        if (!b) return
        const m = 6
        ctx.save()
        ctx.setLineDash([5, 5])
        ctx.strokeStyle = '#6c5ce7'
        ctx.lineWidth = 1.5 / this.viewport.zoomLevel
        ctx.strokeRect(b.x - m, b.y - m, b.w + m * 2, b.h + m * 2)
        ctx.setLineDash([])
        ctx.restore()
    }

    _getShapeBounds(shape) {
        const m = 0
        switch (shape.type) {
            case 'rect':
                return { x: shape.x, y: shape.y, w: shape.width || 0, h: shape.height || 0 }
            case 'circle':
                return { x: shape.x - (shape.radius || 20), y: shape.y - (shape.radius || 20), w: (shape.radius || 20) * 2, h: (shape.radius || 20) * 2 }
            case 'line': case 'arrow':
                return {
                    x: Math.min(shape.startX, shape.endX),
                    y: Math.min(shape.startY, shape.endY),
                    w: Math.abs(shape.endX - shape.startX),
                    h: Math.abs(shape.endY - shape.startY)
                }
            case 'text':
                return { x: shape.x, y: shape.y - (shape.fontSize || 16), w: shape.width || 100, h: (shape.fontSize || 16) * 1.4 }
            case 'path': {
                if (!shape.points || !shape.points.length) return null
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
                for (const p of shape.points) {
                    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y)
                    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y)
                }
                return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
            }
            default: return null
        }
    }

    _getCursorForTool() {
        const tool = this.state.getState().activeTool
        const cursors = {
            select: 'default', hand: 'grab', pen: 'crosshair',
            rect: 'crosshair', circle: 'crosshair', line: 'crosshair',
            arrow: 'crosshair', diamond: 'crosshair', text: 'text', eraser: 'crosshair'
        }
        return cursors[tool] || 'default'
    }

    _onExport(format) {
        const state = this.state.getState()
        if (format === 'svg') {
            const svg = this._buildSVG(state)
            const blob = new Blob([svg], { type: 'image/svg+xml' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = 'sketchvector.svg'; a.click()
            URL.revokeObjectURL(url)
        } else if (format === 'png') {
            const bounds = this._getAllBounds(state.shapes)
            const pad = 20
            const w = bounds.maxX - bounds.minX + pad * 2
            const h = bounds.maxY - bounds.minY + pad * 2
            const canvas = document.createElement('canvas')
            canvas.width = w * 2
            canvas.height = h * 2
            const ctx = canvas.getContext('2d')
            ctx.scale(2, 2)
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, w, h)
            ctx.translate(-bounds.minX + pad, -bounds.minY + pad)
            for (const shape of state.shapes) {
                if (shape.visible === false) continue
                this.renderer.renderShapeTo(ctx, shape)
            }
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url; a.download = 'sketchvector.png'; a.click()
                URL.revokeObjectURL(url)
            })
        } else if (format === 'project') {
            const data = JSON.stringify(state, null, 2)
            const blob = new Blob([data], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = 'sketchvector.sketchvector'; a.click()
            URL.revokeObjectURL(url)
        }
    }

    _onImport() {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.sketchvector,.json'
        input.onchange = (e) => {
            const file = e.target.files[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result)
                    if (data && data.shapes) {
                        this.history.push(this.state.getState())
                        this.state.setState({ shapes: data.shapes, selectedIds: [] })
                        this._drawCanvas()
                    }
                } catch (err) {
                    console.error('Import failed:', err)
                }
            }
            reader.readAsText(file)
        }
        input.click()
    }

    _buildSVG(state) {
        const bounds = this._getAllBounds(state.shapes)
        const pad = 10
        const w = bounds.maxX - bounds.minX + pad * 2
        const h = bounds.maxY - bounds.minY + pad * 2
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${bounds.minX - pad} ${bounds.minY - pad} ${w} ${h}">`
        for (const shape of state.shapes) {
            if (shape.visible === false) continue
            svg += this._shapeToSVG(shape)
        }
        svg += '</svg>'
        return svg
    }

    _shapeToSVG(s) {
        const stroke = s.stroke || '#1e1e1e'
        const fill = s.fill || 'none'
        const sw = s.strokeWidth || 2
        const op = s.opacity !== undefined ? ` opacity="${s.opacity}"` : ''
        const dash = s.strokeStyle === 'dashed' ? ' stroke-dasharray="8 4"' : s.strokeStyle === 'dotted' ? ' stroke-dasharray="2 3" stroke-linecap="round"' : ''
        const swAttr = ` stroke-width="${sw}" stroke="${stroke}"${dash}${op}`
        switch (s.type) {
            case 'rect': {
                const rx = s.edges === 'round' ? ` rx="8"` : ''
                return `<rect x="${s.x}" y="${s.y}" width="${s.width || 0}" height="${s.height || 0}"${rx} fill="${fill}"${swAttr}/>`
            }
            case 'circle': return `<circle cx="${s.x}" cy="${s.y}" r="${s.radius || 20}" fill="${fill}"${swAttr}/>`
            case 'line': return `<line x1="${s.startX}" y1="${s.startY}" x2="${s.endX}" y2="${s.endY}"${swAttr}/>`
            case 'text': return `<text x="${s.x}" y="${(s.y || 0) + (s.fontSize || 20)}" font-size="${s.fontSize || 20}" fill="${stroke}"${op}>${s.text || ''}</text>`
            case 'path': {
                if (!s.points || s.points.length < 2) return ''
                let d = `M${s.points[0].x},${s.points[0].y}`
                for (let i = 1; i < s.points.length; i++) d += ` L${s.points[i].x},${s.points[i].y}`
                return `<path d="${d}" fill="none"${swAttr}/>`
            }
            default: return ''
        }
    }

    _getAllBounds(shapes) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        for (const s of shapes) {
            if (s.visible === false) continue
            if (s.type === 'rect') { minX = Math.min(minX, s.x); minY = Math.min(minY, s.y); maxX = Math.max(maxX, s.x + (s.width || 0)); maxY = Math.max(maxY, s.y + (s.height || 0)) }
            else if (s.type === 'circle') { minX = Math.min(minX, s.x - (s.radius || 20)); minY = Math.min(minY, s.y - (s.radius || 20)); maxX = Math.max(maxX, s.x + (s.radius || 20)); maxY = Math.max(maxY, s.y + (s.radius || 20)) }
            else if (s.type === 'text') { minX = Math.min(minX, s.x); minY = Math.min(minY, s.y); maxX = Math.max(maxX, s.x + (s.width || 100)); maxY = Math.max(maxY, s.y + (s.height || 30)) }
            else if (s.type === 'line' || s.type === 'arrow') { minX = Math.min(minX, s.startX, s.endX); minY = Math.min(minY, s.startY, s.endY); maxX = Math.max(maxX, s.startX, s.endX); maxY = Math.max(maxY, s.startY, s.endY) }
            else if (s.type === 'path' && s.points) { for (const p of s.points) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y) } }
        }
        if (minX === Infinity) { minX = 0; minY = 0; maxX = 100; maxY = 100 }
        return { minX, minY, maxX, maxY }
    }
}
