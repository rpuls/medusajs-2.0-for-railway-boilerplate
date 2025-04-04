type Callback = void | (() => Callback | Promise<Callback>);
interface CreateUndoManagerOptions {
    limit?: number;
}
export declare const UndoManager: {
    canUndo: () => boolean;
    canRedo: () => boolean;
    undo: () => Promise<void>;
    redo: () => Promise<void>;
    execute: (callback: Callback, group?: string) => Promise<void>;
};
export declare function createUndoManager({ limit, }?: CreateUndoManagerOptions): {
    canUndo: () => boolean;
    canRedo: () => boolean;
    undo: () => Promise<void>;
    redo: () => Promise<void>;
    execute: (callback: Callback, group?: string) => Promise<void>;
};
export {};
