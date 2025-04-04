"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystem = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const read_dir_recursive_1 = require("./read-dir-recursive");
const { rm, stat, mkdir, access, readFile, writeFile } = fs_1.promises;
/**
 * File system abstraction to create and cleanup files during
 * tests
 */
class FileSystem {
    constructor(basePath) {
        this.basePath = basePath;
    }
    makePath(filePath) {
        return (0, path_1.join)(this.basePath, filePath);
    }
    /**
     * Cleanup directory
     */
    async cleanup(options) {
        return await rm(this.basePath, {
            recursive: true,
            maxRetries: 10,
            force: true,
            ...options,
        });
    }
    /**
     * Creates a directory inside the root of the filesystem
     * path. You may use this method to create nested
     * directories as well.
     */
    mkdir(dirPath, options) {
        return mkdir(this.makePath(dirPath), { recursive: true, ...options });
    }
    /**
     * Create a new file
     */
    async create(filePath, contents, options) {
        const absolutePath = this.makePath(filePath);
        await mkdir((0, path_1.dirname)(absolutePath), { recursive: true });
        return writeFile(this.makePath(filePath), contents, options);
    }
    /**
     * Remove a file
     */
    async remove(filePath, options) {
        return await rm(this.makePath(filePath), {
            recursive: true,
            force: true,
            maxRetries: 2,
            ...options,
        });
    }
    /**
     * Check if the root of the filesystem exists
     */
    async rootExists() {
        try {
            await access(this.basePath, fs_1.constants.F_OK);
            return true;
        }
        catch (error) {
            if (error.code === "ENOENT") {
                return false;
            }
            throw error;
        }
    }
    /**
     * Check if a file exists
     */
    async exists(filePath) {
        try {
            await access(this.makePath(filePath), fs_1.constants.F_OK);
            return true;
        }
        catch (error) {
            if (error.code === "ENOENT") {
                return false;
            }
            throw error;
        }
    }
    /**
     * Returns file contents
     */
    async contents(filePath) {
        return await readFile(this.makePath(filePath), "utf-8");
    }
    /**
     * Dumps file contents to the stdout
     */
    async dump(filePath) {
        console.log("------------------------------------------------------------");
        console.log(`file path => "${filePath}"`);
        console.log(`contents => "${await this.contents(filePath)}"`);
    }
    /**
     * Returns stats for a file
     */
    async stats(filePath, options) {
        return stat(this.makePath(filePath), options);
    }
    /**
     * Recursively reads files from a given directory
     */
    readDir(dirPath) {
        const location = dirPath ? this.makePath(dirPath) : this.basePath;
        return (0, read_dir_recursive_1.readDirRecursive)(location);
    }
    /**
     * Create a json file
     */
    async createJson(filePath, contents, options) {
        if (options && typeof options === "object") {
            const { replacer, spaces, ...rest } = options;
            return await this.create(filePath, JSON.stringify(contents, replacer, spaces), rest);
        }
        return await this.create(filePath, JSON.stringify(contents), options);
    }
    /**
     * Read and parse a json file
     */
    async contentsJson(filePath) {
        const contents = await readFile(this.makePath(filePath), "utf-8");
        return JSON.parse(contents);
    }
}
exports.FileSystem = FileSystem;
//# sourceMappingURL=file-system.js.map