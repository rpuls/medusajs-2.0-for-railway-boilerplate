"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadModels = loadModels;
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Load all the models from the given path
 * @param basePath
 */
function loadModels(basePath) {
    const excludedExtensions = [".ts.map", ".js.map", ".d.ts"];
    let modelsFiles = [];
    try {
        modelsFiles = (0, fs_1.readdirSync)(basePath);
    }
    catch (e) { }
    return modelsFiles
        .flatMap((file) => {
        if (file.startsWith("index.") ||
            excludedExtensions.some((ext) => file.endsWith(ext))) {
            return;
        }
        const filePath = (0, path_1.join)(basePath, file);
        const stats = (0, fs_1.statSync)(filePath);
        if (stats.isFile()) {
            try {
                const required = require(filePath);
                return Object.values(required).filter((resource) => !!resource.name);
            }
            catch (e) { }
        }
        return;
    })
        .filter(Boolean);
}
//# sourceMappingURL=load-models.js.map