"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/utils/undo.ts
function createUndoCallback(callback) {
  return async () => {
    const redo = await (callback == null ? void 0 : callback());
    return createUndoCallback(async () => {
      await (redo == null ? void 0 : redo());
      return callback;
    });
  };
}
var UndoManager = createUndoManager();
function createUndoManager({
  limit = 100
} = {}) {
  const undoStack = [];
  let redoStack = [];
  let currentGroup = null;
  const canUndo = () => undoStack.length > 0;
  const canRedo = () => redoStack.length > 0;
  const undo = async () => {
    var _a;
    if (!canUndo()) return;
    currentGroup = null;
    redoStack.push(await ((_a = undoStack.pop()) == null ? void 0 : _a()));
  };
  const redo = async () => {
    var _a;
    if (!canRedo()) return;
    currentGroup = null;
    undoStack.push(await ((_a = redoStack.pop()) == null ? void 0 : _a()));
  };
  const execute = async (callback, group) => {
    if (!callback) return;
    while (undoStack.length > limit) {
      undoStack.shift();
    }
    const sameGroup = group === currentGroup;
    currentGroup = group != null ? group : null;
    const nextIndex = sameGroup ? Math.max(0, undoStack.length - 1) : undoStack.length;
    const undoCallback = await callback();
    if (!undoCallback) return;
    redoStack = [];
    const currentUndo = undoStack[nextIndex];
    undoStack[nextIndex] = createUndoCallback(async () => {
      await (undoCallback == null ? void 0 : undoCallback());
      const currentRedo = await (currentUndo == null ? void 0 : currentUndo());
      return async () => {
        await (currentRedo == null ? void 0 : currentRedo());
        await (callback == null ? void 0 : callback());
      };
    });
  };
  return {
    canUndo,
    canRedo,
    undo,
    redo,
    execute
  };
}




exports.UndoManager = UndoManager; exports.createUndoManager = createUndoManager;
