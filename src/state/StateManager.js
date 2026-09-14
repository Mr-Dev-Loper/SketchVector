export default class StateManager {
    constructor() {
        this._state = {
            shapes: [],
            selectedIds: [],
            activeTool: 'select',
            viewport: { x: 0, y: 0, zoom: 1 },
            colors: { fill: 'transparent', stroke: '#000000' },
            strokeWidth: 2,
            opacity: 1,
            handDrawn: false,
            layers: [{ id: 'default', name: 'Layer 1', visible: true, locked: false }],
            gridEnabled: false,
            theme: 'light'
        }
        this._listeners = new Set()
    }

    getState() {
        return this._state
    }

    setState(partial) {
        this._state = { ...this._state, ...partial }
        this.notify()
    }

    subscribe(listener) {
        this._listeners.add(listener)
        return () => this._listeners.delete(listener)
    }

    unsubscribe(listener) {
        this._listeners.delete(listener)
    }

    notify() {
        for (const listener of this._listeners) {
            listener(this._state)
        }
    }
}
