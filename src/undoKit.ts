
export interface Undoable {
    undo(): void
    redo(): void
}

export class UndoKit {
    #undoList: Undoable[][] = []
    #redoList: Undoable[][] = []
    #limit: number = 500

    constructor() {}

    /**
     * Adds an undoable object to the collector.
     * @param undoables - The undoable objects to add.
     */
    push(...undoables: Undoable[]) {
        if (this.#undoList.length === this.#limit) {
            this.#undoList.shift()
        }

        this.#undoList.push(undoables)
        undoables.forEach(r => { r.redo() })
        this.#redoList = [] /* The redoable objects must be removed. */
    }

    /**
     * Undoes the last undoable object.
     */
    undo() {
        if (this.#undoList.length) {
            let undoable = this.#undoList.pop()!
            undoable.forEach(u => {
                u.undo()
            })
            this.#redoList.push(undoable)
            return
        }
        console.log("No more undo available.")
    }

    /**
     * Redoes the last undoable object.
     */
    redo() {
        if (this.#redoList.length) {
            let undoable = this.#redoList.pop()!
            undoable.forEach(r => { r.redo() })
            this.#undoList.push(undoable)
            return
        }
        console.log("No more redo available.")

    }

    /**
     * @param limit The max number of saved undoable objects. Oldest ones will be removed from queue to be able to add new ones 
     * after limit reached. Must be great than 0.
     */
    setLimit(limit: number) {
        if (limit >= 0) {
            let i = 0
            let nb = this.#undoList.length - limit
            while (i < nb) {
                this.#undoList.pop()
                i++
            }
            this.#limit = limit
        }
    }

    clearHistory() {
        this.#undoList = []
        this.#redoList = []
    }
}

export class SetValueCmd<T> implements Undoable {
    object: { [value: string]: T }
    property: string
    oldValue: T
    newValue: T

    constructor(object: {}, newValue: T, property: string = "value") {
        this.object = object
        this.property = property
        this.oldValue = this.object[this.property]
        this.newValue = newValue
    }

    undo() {
        this.object[this.property] = this.oldValue
    }

    redo() {
        this.object[this.property] = this.newValue
    }

    merge(newValue: T) {
        this.newValue = newValue
    }
}
