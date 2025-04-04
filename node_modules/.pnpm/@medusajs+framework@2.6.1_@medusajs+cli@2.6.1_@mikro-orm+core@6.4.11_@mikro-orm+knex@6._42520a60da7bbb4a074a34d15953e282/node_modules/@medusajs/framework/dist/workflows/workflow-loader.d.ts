import { ResourceLoader } from "../utils/resource-loader";
export declare class WorkflowLoader extends ResourceLoader {
    protected resourceName: string;
    constructor(sourceDir: string | string[]);
    protected onFileLoaded(path: string, fileExports: Record<string, unknown>): Promise<void>;
    /**
     * Load workflows from the source paths, workflows are registering themselves,
     * therefore we only need to import them
     */
    load(): Promise<void>;
}
//# sourceMappingURL=workflow-loader.d.ts.map