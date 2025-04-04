import { ResourceLoader } from "../utils/resource-loader";
export declare class SubscriberLoader extends ResourceLoader {
    #private;
    protected resourceName: string;
    constructor(sourceDir: string | string[], options?: Record<string, unknown>);
    protected onFileLoaded(path: string, fileExports: Record<string, unknown>): Promise<void>;
    private validateSubscriber;
    private inferIdentifier;
    private createSubscriber;
    load(): Promise<string[]>;
}
//# sourceMappingURL=subscriber-loader.d.ts.map