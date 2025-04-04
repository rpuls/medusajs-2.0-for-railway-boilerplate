export declare class LinkLoader {
    #private;
    constructor(sourceDir: string | string[]);
    /**
     * Load links from the source paths, links are registering themselves,
     * therefore we only need to import them
     */
    load(): Promise<void>;
}
//# sourceMappingURL=link-loader.d.ts.map