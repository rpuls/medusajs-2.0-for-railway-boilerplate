"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSlashes = exports.cleanPath = void 0;
const path_1 = require("path");
function cleanPath(path) {
    let normalized = (0, path_1.normalize)(path);
    // we have to remove the last path separator
    // to account for / root path
    if (normalized.length > 1 && normalized[normalized.length - 1] === path_1.sep)
        normalized = normalized.substring(0, normalized.length - 1);
    return normalized;
}
exports.cleanPath = cleanPath;
const SLASHES_REGEX = /[\\/]/g;
function convertSlashes(path, separator) {
    return path.replace(SLASHES_REGEX, separator);
}
exports.convertSlashes = convertSlashes;
