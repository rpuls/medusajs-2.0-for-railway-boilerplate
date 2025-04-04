import { Dirent } from "fs";
export declare function readDir(dir: string, options?: {
    ignoreMissing?: boolean;
}): Promise<Dirent[]>;
export declare function readDirRecursive(dir: string, options?: {
    ignoreMissing?: boolean;
}): Promise<Dirent[]>;
//# sourceMappingURL=read-dir-recursive.d.ts.map