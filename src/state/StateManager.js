export default class StateManager {
    constructor() {
        this._state = {
            activeTool: 'select',
            shapes: [],
            selectedIds: [],
            stroke: '#1e1e1e',
            fill: 'transparent',
            strokeWidth: 2,
            opacity: 1,
            handDrawn: false,
            fontSize: 20,
            fontFamily: 'Arial',
            theme: 'light',
        }
        this._listeners = []
    }

    getState() {
        return this._state
    }

    setState(partial) {
        this._state = { ...this._state, ...partial }
        this._notify()
    }

    subscribe(fn) {
        this._listeners.push(fn)
        return () => {
            this._listeners = this._listeners.filter(l => l !== fn)
        }
    }

    _notify() {
        for (const fn of this._listeners) fn(this._state)
    }
}
