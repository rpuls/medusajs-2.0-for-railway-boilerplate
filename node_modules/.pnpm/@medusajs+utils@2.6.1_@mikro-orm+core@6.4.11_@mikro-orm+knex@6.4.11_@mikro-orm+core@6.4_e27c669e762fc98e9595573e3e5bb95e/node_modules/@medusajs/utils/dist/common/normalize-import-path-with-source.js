"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeImportPathWithSource = normalizeImportPathWithSource;
const path_1 = require("path");
/**
 * Normalize the import path based on the project running on ts-node or not.
 * @param path
 */
function normalizeImportPathWithSource(path) {
    let normalizePath = path;
    if (normalizePath?.startsWith("./")) {
        /**
         * If someone is using the correct path pointing to the "src" directory
         * then we are all good. Otherwise we will point to the "src" directory.
         *
         * In case of the production output. The app should be executed from within
         * the "./build" directory and the "./build" directory will have the
         * "./src" directory inside it.
         */
        let sourceDir = normalizePath.startsWith("./src") ? "./" : "./src";
        normalizePath = (0, path_1.join)(process.cwd(), sourceDir, normalizePath);
    }
    return normalizePath ?? "";
}
//# sourceMappingURL=normalize-import-path-with-source.js.map