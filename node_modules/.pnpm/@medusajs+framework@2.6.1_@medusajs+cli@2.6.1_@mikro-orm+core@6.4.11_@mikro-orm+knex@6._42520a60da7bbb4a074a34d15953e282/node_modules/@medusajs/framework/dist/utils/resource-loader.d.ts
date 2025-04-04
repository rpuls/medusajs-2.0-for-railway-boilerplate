import { Dirent } from "fs";
export declare abstract class ResourceLoader {
    #private;
    /**
     * The name of the resource (e.g job, subscriber, workflow)
     */
    protected abstract resourceName: string;
    constructor(sourceDir: string | string[]);
    /**
     * Discover resources from the source directory
     * @param exclude - custom exclusion regexes
     * @param customFiltering - custom filtering function
     * @returns The resources discovered
     */
    protected discoverResources({ exclude, customFiltering, }?: {
        exclude?: RegExp[];
        customFiltering?: (entry: Dirent) => boolean;
    }): Promise<Record<string, unknown>[]>;
    /**
     * Called when a file is imported
     * @param path - The path of the file
     * @param fileExports - The exports of the file
     */
    protected abstract onFileLoaded(path: string, fileExports: Record<string, unknown>): Promise<void> | never;
}
//# sourceMappingURL=resource-loader.d.ts.map