"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const pushDirectory = (directoryPath, paths) => {
    paths.push(directoryPath || ".");
};
const pushDirectoryFilter = (directoryPath, paths, filters) => {
    if (filters.every((filter) => filter(directoryPath, true))) {
        paths.push(directoryPath);
    }
};
const empty = () => { };
function build(options) {
    const { includeDirs, filters } = options;
    if (!includeDirs)
        return empty;
    return filters && filters.length ? pushDirectoryFilter : pushDirectory;
}
exports.build = build;
