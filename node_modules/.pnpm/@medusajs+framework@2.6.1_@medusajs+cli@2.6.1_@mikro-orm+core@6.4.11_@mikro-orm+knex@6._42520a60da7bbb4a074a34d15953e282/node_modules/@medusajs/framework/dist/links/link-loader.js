"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _LinkLoader_sourceDir, _LinkLoader_excludes;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkLoader = void 0;
const utils_1 = require("@medusajs/utils");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const logger_1 = require("../logger");
class LinkLoader {
    constructor(sourceDir) {
        /**
         * The directory from which to load the links
         * @private
         */
        _LinkLoader_sourceDir.set(this, void 0);
        /**
         * The list of file names to exclude from the subscriber scan
         * @private
         */
        _LinkLoader_excludes.set(this, [
            /index\.js/,
            /index\.ts/,
            /\.DS_Store/,
            /(\.ts\.map|\.js\.map|\.d\.ts|\.md)/,
            /^_[^/\\]*(\.[^/\\]+)?$/,
        ]);
        __classPrivateFieldSet(this, _LinkLoader_sourceDir, sourceDir, "f");
    }
    /**
     * Load links from the source paths, links are registering themselves,
     * therefore we only need to import them
     */
    async load() {
        const normalizedSourcePath = Array.isArray(__classPrivateFieldGet(this, _LinkLoader_sourceDir, "f"))
            ? __classPrivateFieldGet(this, _LinkLoader_sourceDir, "f")
            : [__classPrivateFieldGet(this, _LinkLoader_sourceDir, "f")];
        const promises = normalizedSourcePath.map(async (sourcePath) => {
            try {
                await (0, promises_1.access)(sourcePath);
            }
            catch {
                logger_1.logger.info(`No link to load from ${sourcePath}. skipped.`);
                return;
            }
            return await (0, utils_1.readDirRecursive)(sourcePath).then(async (entries) => {
                const fileEntries = entries.filter((entry) => {
                    return (!entry.isDirectory() &&
                        !__classPrivateFieldGet(this, _LinkLoader_excludes, "f").some((exclude) => exclude.test(entry.name)));
                });
                logger_1.logger.debug(`Registering links from ${sourcePath}.`);
                return await (0, utils_1.promiseAll)(fileEntries.map(async (entry) => {
                    const fullPath = (0, path_1.join)(entry.path, entry.name);
                    return await (0, utils_1.dynamicImport)(fullPath);
                }));
            });
        });
        await (0, utils_1.promiseAll)(promises);
        logger_1.logger.debug(`Links registered.`);
    }
}
exports.LinkLoader = LinkLoader;
_LinkLoader_sourceDir = new WeakMap(), _LinkLoader_excludes = new WeakMap();
//# sourceMappingURL=link-loader.js.map