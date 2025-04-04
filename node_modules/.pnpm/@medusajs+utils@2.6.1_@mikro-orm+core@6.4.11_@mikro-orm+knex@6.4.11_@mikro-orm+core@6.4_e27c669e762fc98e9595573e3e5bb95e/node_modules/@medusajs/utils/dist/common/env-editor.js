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
var _EnvEditor_instances, _EnvEditor_appRoot, _EnvEditor_files, _EnvEditor_readFile;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvEditor = void 0;
const path_1 = require("path");
const promises_1 = require("fs/promises");
/**
 * Exposes the API to edit Env files
 */
class EnvEditor {
    constructor(appRoot) {
        _EnvEditor_instances.add(this);
        _EnvEditor_appRoot.set(this, void 0);
        _EnvEditor_files.set(this, []);
        __classPrivateFieldSet(this, _EnvEditor_appRoot, appRoot, "f");
    }
    /**
     * Loads .env and .env.template files for editing.
     */
    async load() {
        __classPrivateFieldSet(this, _EnvEditor_files, await Promise.all([(0, path_1.join)(__classPrivateFieldGet(this, _EnvEditor_appRoot, "f"), ".env"), (0, path_1.join)(__classPrivateFieldGet(this, _EnvEditor_appRoot, "f"), ".env.template")].map((filePath) => __classPrivateFieldGet(this, _EnvEditor_instances, "m", _EnvEditor_readFile).call(this, filePath))), "f");
    }
    /**
     * Returns the value for an existing key from the
     * ".env" file
     */
    get(key) {
        const envFile = __classPrivateFieldGet(this, _EnvEditor_files, "f").find((file) => file.filePath.endsWith(".env"));
        if (!envFile) {
            return null;
        }
        const matchingLine = envFile.contents.find((line) => line.startsWith(`${key}=`));
        if (!matchingLine) {
            return null;
        }
        const [_, ...rest] = matchingLine.split("=");
        return rest.join("=");
    }
    /**
     * Set key-value pair to the dot-env files.
     *
     * If `withEmptyTemplateValue` is true then the key will be added with an empty value
     * to the `.env.template` file.
     */
    set(key, value, options) {
        const withEmptyTemplateValue = options?.withEmptyTemplateValue ?? false;
        __classPrivateFieldGet(this, _EnvEditor_files, "f").forEach((file) => {
            let entryIndex = file.contents.findIndex((line) => line.startsWith(`${key}=`));
            const writeIndex = entryIndex === -1 ? file.contents.length : entryIndex;
            if (withEmptyTemplateValue && file.filePath.endsWith(".env.template")) {
                /**
                 * Do not remove existing template value (if any)
                 */
                if (entryIndex === -1) {
                    file.contents[writeIndex] = `${key}=`;
                }
            }
            else {
                file.contents[writeIndex] = `${key}=${value}`;
            }
        });
    }
    /**
     * Get files and their contents as JSON
     */
    toJSON() {
        return __classPrivateFieldGet(this, _EnvEditor_files, "f");
    }
    /**
     * Save changes back to the disk
     */
    async save() {
        await Promise.all(__classPrivateFieldGet(this, _EnvEditor_files, "f").map((file) => {
            return (0, promises_1.writeFile)(file.filePath, file.contents.join("\n"));
        }));
    }
}
exports.EnvEditor = EnvEditor;
_EnvEditor_appRoot = new WeakMap(), _EnvEditor_files = new WeakMap(), _EnvEditor_instances = new WeakSet(), _EnvEditor_readFile = 
/**
 * Reads a file and returns with contents. Ignores error
 * when file is missing
 */
async function _EnvEditor_readFile(filePath) {
    try {
        const contents = await (0, promises_1.readFile)(filePath, "utf-8");
        return {
            exists: true,
            contents: contents.split(/\r?\n/),
            filePath,
        };
    }
    catch (error) {
        if (error.code === "ENOENT") {
            return {
                exists: false,
                contents: [],
                filePath,
            };
        }
        throw error;
    }
};
//# sourceMappingURL=env-editor.js.map