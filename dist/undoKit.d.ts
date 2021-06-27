export interface Undoable {
    undo(): void;
    redo(): void;
}
export declare class UndoKit {
    #private;
    constructor();
    /**
     * Adds an undoable object to the collector.
     * @param undoables - The undoable objects to add.
     */
    push(...undoables: Undoable[]): void;
    /**
     * Undoes the last undoable object.
     */
    undo(): void;
    /**
     * Redoes the last undoable object.
     */
    redo(): void;
    /**
     * @param limit The max number of saved undoable objects. Oldest ones will be removed from queue to be able to add new ones
     * after limit reached. Must be great than 0.
     */
    setLimit(limit: number): void;
    clearHistory(): void;
}
export declare class SetValueCmd<T> implements Undoable {
    object: {
        [value: string]: T;
    };
    property: string;
    oldValue: T;
    newValue: T;
    constructor(object: {}, newValue: T, property?: string);
    undo(): void;
    redo(): void;
    merge(newValue: T): void;
}
