export default class History {
    constructor(maxSize = 50) {
        this.undoStack = []
        this.redoStack = []
        this.maxSize = maxSize
    }

    push(previousState) {
        this.undoStack.push(JSON.parse(JSON.stringify(previousState)))
        if (this.undoStack.length > this.maxSize) {
            this.undoStack.shift()
        }
        this.redoStack = []
    }

    undo(currentState) {
        if (!this.canUndo()) return null
        const state = this.undoStack.pop()
        this.redoStack.push(JSON.parse(JSON.stringify(currentState)))
        return state
    }

    redo(currentState) {
        if (!this.canRedo()) return null
        const state = this.redoStack.pop()
        this.undoStack.push(JSON.parse(JSON.stringify(currentState)))
        return state
    }

    canUndo() {
        return this.undoStack.length > 0
    }

    canRedo() {
        return this.redoStack.length > 0
    }

    clear() {
        this.undoStack = []
        this.redoStack = []
    }
}
