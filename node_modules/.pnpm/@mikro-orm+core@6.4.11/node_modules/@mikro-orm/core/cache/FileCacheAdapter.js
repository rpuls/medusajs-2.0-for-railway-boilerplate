"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileCacheAdapter = void 0;
const globby_1 = __importDefault(require("globby"));
const fs_extra_1 = require("fs-extra");
const Utils_1 = require("../utils/Utils");
class FileCacheAdapter {
    options;
    baseDir;
    pretty;
    VERSION = Utils_1.Utils.getORMVersion();
    cache = {};
    constructor(options, baseDir, pretty = false) {
        this.options = options;
        this.baseDir = baseDir;
        this.pretty = pretty;
    }
    /**
     * @inheritDoc
     */
    get(name) {
        const path = this.path(name);
        if (!(0, fs_extra_1.pathExistsSync)(path)) {
            return null;
        }
        const payload = (0, fs_extra_1.readJSONSync)(path);
        const hash = this.getHash(payload.origin);
        if (!hash || payload.hash !== hash) {
            return null;
        }
        return payload.data;
    }
    /**
     * @inheritDoc
     */
    set(name, data, origin) {
        if (this.options.combined) {
            this.cache[name.replace(/\.[jt]s$/, '')] = data;
            return;
        }
        const path = this.path(name);
        const hash = this.getHash(origin);
        const opts = this.pretty ? { spaces: 2 } : {};
        (0, fs_extra_1.writeJSONSync)(path, { data, origin, hash, version: this.VERSION }, opts);
    }
    /**
     * @inheritDoc
     */
    remove(name) {
        const path = this.path(name);
        (0, fs_extra_1.unlinkSync)(path);
    }
    /**
     * @inheritDoc
     */
    clear() {
        const path = this.path('*');
        const files = globby_1.default.sync(path);
        files.forEach(file => (0, fs_extra_1.unlinkSync)(file));
        this.cache = {};
    }
    combine() {
        if (!this.options.combined) {
            return;
        }
        let path = typeof this.options.combined === 'string'
            ? this.options.combined
            : './metadata.json';
        path = Utils_1.Utils.normalizePath(this.options.cacheDir, path);
        this.options.combined = path; // override in the options, so we can log it from the CLI in `cache:generate` command
        (0, fs_extra_1.writeJSONSync)(path, this.cache, { spaces: this.pretty ? 2 : undefined });
        return path;
    }
    path(name) {
        (0, fs_extra_1.ensureDirSync)(this.options.cacheDir);
        return `${this.options.cacheDir}/${name}.json`;
    }
    getHash(origin) {
        origin = Utils_1.Utils.absolutePath(origin, this.baseDir);
        if (!(0, fs_extra_1.pathExistsSync)(origin)) {
            return null;
        }
        const contents = (0, fs_extra_1.readFileSync)(origin);
        return Utils_1.Utils.hash(contents.toString() + this.VERSION);
    }
}
exports.FileCacheAdapter = FileCacheAdapter;
