import { type Dirent, type MakeDirectoryOptions, type RmOptions, type StatOptions, type WriteFileOptions } from "fs";
export type JSONFileOptions = WriteFileOptions & {
    spaces?: number | string;
    replacer?: (this: any, key: string, value: any) => any;
};
/**
 * File system abstraction to create and cleanup files during
 * tests
 */
export declare class FileSystem {
    basePath: string;
    constructor(basePath: string);
    private makePath;
    /**
     * Cleanup directory
     */
    cleanup(options?: RmOptions): Promise<void>;
    /**
     * Creates a directory inside the root of the filesystem
     * path. You may use this method to create nested
     * directories as well.
     */
    mkdir(dirPath: string, options?: MakeDirectoryOptions): Promise<string | undefined>;
    /**
     * Create a new file
     */
    create(filePath: string, contents: string, options?: WriteFileOptions): Promise<void>;
    /**
     * Remove a file
     */
    remove(filePath: string, options?: RmOptions): Promise<void>;
    /**
     * Check if the root of the filesystem exists
     */
    rootExists(): Promise<boolean>;
    /**
     * Check if a file exists
     */
    exists(filePath: string): Promise<boolean>;
    /**
     * Returns file contents
     */
    contents(filePath: string): Promise<string>;
    /**
     * Dumps file contents to the stdout
     */
    dump(filePath: string): Promise<void>;
    /**
     * Returns stats for a file
     */
    stats(filePath: string, options?: StatOptions): Promise<import("fs").Stats | import("fs").BigIntStats>;
    /**
     * Recursively reads files from a given directory
     */
    readDir(dirPath?: string): Promise<Dirent[]>;
    /**
     * Create a json file
     */
    createJson(filePath: string, contents: any, options?: JSONFileOptions): Promise<void>;
    /**
     * Read and parse a json file
     */
    contentsJson(filePath: string): Promise<any>;
}
//# sourceMappingURL=file-system.d.ts.map