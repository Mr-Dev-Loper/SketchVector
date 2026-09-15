export default class History {
    constructor(maxSize = 80) {
        this.undoStack = []
        this.redoStack = []
        this.maxSize = maxSize
    }

    push(state) {
        this.undoStack.push(JSON.parse(JSON.stringify(state)))
        if (this.undoStack.length > this.maxSize) this.undoStack.shift()
        this.redoStack = []
    }

    undo(currentState) {
        if (this.undoStack.length === 0) return null
        this.redoStack.push(JSON.parse(JSON.stringify(currentState)))
        return this.undoStack.pop()
    }

    redo(currentState) {
        if (this.redoStack.length === 0) return null
        this.undoStack.push(JSON.parse(JSON.stringify(currentState)))
        return this.redoStack.pop()
    }

    canUndo() { return this.undoStack.length > 0 }
    canRedo() { return this.redoStack.length > 0 }
    clear() { this.undoStack = []; this.redoStack = [] }
}
