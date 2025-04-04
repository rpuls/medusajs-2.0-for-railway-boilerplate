"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = exports.joinDirectoryPath = void 0;
function joinPathWithBasePath(filename, directoryPath) {
    return directoryPath + filename;
}
function joinPathWithRelativePath(root) {
    return function (filename, directoryPath) {
        return directoryPath.substring(root.length) + filename;
    };
}
function joinPath(filename) {
    return filename;
}
function joinDirectoryPath(filename, directoryPath, separator) {
    return directoryPath + filename + separator;
}
exports.joinDirectoryPath = joinDirectoryPath;
function build(root, options) {
    const { relativePaths, includeBasePath } = options;
    return relativePaths && root
        ? joinPathWithRelativePath(root)
        : includeBasePath
            ? joinPathWithBasePath
            : joinPath;
}
exports.build = build;
