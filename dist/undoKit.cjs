"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _UndoKit_undoList, _UndoKit_redoList, _UndoKit_limit;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetValueCmd = exports.UndoKit = void 0;
class UndoKit {
    constructor() {
        _UndoKit_undoList.set(this, []);
        _UndoKit_redoList.set(this, []);
        _UndoKit_limit.set(this, 500);
    }
    /**
     * Adds an undoable object to the collector.
     * @param undoables - The undoable objects to add.
     */
    push(...undoables) {
        if (__classPrivateFieldGet(this, _UndoKit_undoList, "f").length === __classPrivateFieldGet(this, _UndoKit_limit, "f")) {
            __classPrivateFieldGet(this, _UndoKit_undoList, "f").shift();
        }
        __classPrivateFieldGet(this, _UndoKit_undoList, "f").push(undoables);
        undoables.forEach(r => { r.redo(); });
        __classPrivateFieldSet(this, _UndoKit_redoList, [], "f"); /* The redoable objects must be removed. */
    }
    /**
     * Undoes the last undoable object.
     */
    undo() {
        if (__classPrivateFieldGet(this, _UndoKit_undoList, "f").length) {
            let undoable = __classPrivateFieldGet(this, _UndoKit_undoList, "f").pop();
            undoable.forEach(u => {
                u.undo();
            });
            __classPrivateFieldGet(this, _UndoKit_redoList, "f").push(undoable);
            return;
        }
        console.log("No more undo available.");
    }
    /**
     * Redoes the last undoable object.
     */
    redo() {
        if (__classPrivateFieldGet(this, _UndoKit_redoList, "f").length) {
            let undoable = __classPrivateFieldGet(this, _UndoKit_redoList, "f").pop();
            undoable.forEach(r => { r.redo(); });
            __classPrivateFieldGet(this, _UndoKit_undoList, "f").push(undoable);
            return;
        }
        console.log("No more redo available.");
    }
    /**
     * @param limit The max number of saved undoable objects. Oldest ones will be removed from queue to be able to add new ones
     * after limit reached. Must be great than 0.
     */
    setLimit(limit) {
        if (limit >= 0) {
            let i = 0;
            let nb = __classPrivateFieldGet(this, _UndoKit_undoList, "f").length - limit;
            while (i < nb) {
                __classPrivateFieldGet(this, _UndoKit_undoList, "f").pop();
                i++;
            }
            __classPrivateFieldSet(this, _UndoKit_limit, limit, "f");
        }
    }
    clearHistory() {
        __classPrivateFieldSet(this, _UndoKit_undoList, [], "f");
        __classPrivateFieldSet(this, _UndoKit_redoList, [], "f");
    }
}
exports.UndoKit = UndoKit;
_UndoKit_undoList = new WeakMap(), _UndoKit_redoList = new WeakMap(), _UndoKit_limit = new WeakMap();
class SetValueCmd {
    constructor(object, newValue, property = "value") {
        this.object = object;
        this.property = property;
        this.oldValue = this.object[this.property];
        this.newValue = newValue;
    }
    undo() {
        this.object[this.property] = this.oldValue;
    }
    redo() {
        this.object[this.property] = this.newValue;
    }
    merge(newValue) {
        this.newValue = newValue;
    }
}
exports.SetValueCmd = SetValueCmd;
