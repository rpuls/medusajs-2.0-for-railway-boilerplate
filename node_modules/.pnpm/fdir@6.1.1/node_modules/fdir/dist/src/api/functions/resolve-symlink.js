"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const fs_1 = __importDefault(require("fs"));
const resolveSymlinksAsync = function (path, state, callback) {
    const { queue, options: { suppressErrors }, } = state;
    queue.enqueue();
    fs_1.default.realpath(path, (error, resolvedPath) => {
        if (error) {
            queue.dequeue(suppressErrors ? null : error, state);
            return;
        }
        fs_1.default.lstat(resolvedPath, (_error, stat) => {
            callback(stat, resolvedPath);
            queue.dequeue(null, state);
        });
    });
};
const resolveSymlinksSync = function (path, state, callback) {
    try {
        const resolvedPath = fs_1.default.realpathSync(path);
        const stat = fs_1.default.lstatSync(resolvedPath);
        callback(stat, resolvedPath);
    }
    catch (e) {
        if (!state.options.suppressErrors)
            throw e;
    }
};
function build(options, isSynchronous) {
    if (!options.resolveSymlinks)
        return null;
    return isSynchronous ? resolveSymlinksSync : resolveSymlinksAsync;
}
exports.build = build;
