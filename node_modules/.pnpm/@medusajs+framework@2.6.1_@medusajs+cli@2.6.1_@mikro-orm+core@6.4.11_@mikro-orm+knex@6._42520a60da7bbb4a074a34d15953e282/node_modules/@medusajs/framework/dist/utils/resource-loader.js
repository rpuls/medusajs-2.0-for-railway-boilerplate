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
var _ResourceLoader_sourceDir, _ResourceLoader_excludes;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceLoader = void 0;
const utils_1 = require("@medusajs/utils");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const logger_1 = require("../logger");
class ResourceLoader {
    constructor(sourceDir) {
        /**
         * The directory from which to load the jobs
         * @private
         */
        _ResourceLoader_sourceDir.set(this, void 0);
        /**
         * The list of file names to exclude from the subscriber scan
         * @private
         */
        _ResourceLoader_excludes.set(this, [/^_[^/\\]*(\.[^/\\]+)?$/]);
        __classPrivateFieldSet(this, _ResourceLoader_sourceDir, sourceDir, "f");
    }
    /**
     * Discover resources from the source directory
     * @param exclude - custom exclusion regexes
     * @param customFiltering - custom filtering function
     * @returns The resources discovered
     */
    async discoverResources({ exclude, customFiltering, } = {}) {
        exclude ??= [];
        customFiltering ??= (entry) => {
            const parsedName = (0, path_1.parse)(entry.name);
            return (!entry.isDirectory() &&
                parsedName.name !== "index" &&
                !parsedName.base.endsWith(".d.ts") &&
                [".js", ".ts"].includes(parsedName.ext) &&
                !__classPrivateFieldGet(this, _ResourceLoader_excludes, "f").some((exclude) => exclude.test(parsedName.base)) &&
                !exclude.some((exclude) => exclude.test(parsedName.base)));
        };
        const normalizedSourcePath = Array.isArray(__classPrivateFieldGet(this, _ResourceLoader_sourceDir, "f"))
            ? __classPrivateFieldGet(this, _ResourceLoader_sourceDir, "f")
            : [__classPrivateFieldGet(this, _ResourceLoader_sourceDir, "f")];
        const promises = normalizedSourcePath.map(async (sourcePath) => {
            try {
                await (0, promises_1.access)(sourcePath);
            }
            catch {
                logger_1.logger.info(`No ${this.resourceName} to load from ${sourcePath}. skipped.`);
                return;
            }
            return await (0, utils_1.readDirRecursive)(sourcePath).then(async (entries) => {
                const fileEntries = entries.filter((entry) => customFiltering(entry));
                return await (0, utils_1.promiseAll)(fileEntries.map(async (entry) => {
                    const fullPath = (0, path_1.join)(entry.path, entry.name);
                    const module_ = await (0, utils_1.dynamicImport)(fullPath);
                    await this.onFileLoaded(fullPath, module_);
                    return module_;
                }));
            });
        });
        const resources = await (0, utils_1.promiseAll)(promises);
        return resources.flat();
    }
}
exports.ResourceLoader = ResourceLoader;
_ResourceLoader_sourceDir = new WeakMap(), _ResourceLoader_excludes = new WeakMap();
//# sourceMappingURL=resource-loader.js.map