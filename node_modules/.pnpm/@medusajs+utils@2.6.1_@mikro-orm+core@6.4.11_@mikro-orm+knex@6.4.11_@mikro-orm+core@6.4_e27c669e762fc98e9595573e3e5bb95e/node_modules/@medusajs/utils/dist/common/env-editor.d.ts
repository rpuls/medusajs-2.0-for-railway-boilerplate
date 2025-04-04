/**
 * Exposes the API to edit Env files
 */
export declare class EnvEditor {
    #private;
    constructor(appRoot: string);
    /**
     * Loads .env and .env.template files for editing.
     */
    load(): Promise<void>;
    /**
     * Returns the value for an existing key from the
     * ".env" file
     */
    get(key: string): string | null;
    /**
     * Set key-value pair to the dot-env files.
     *
     * If `withEmptyTemplateValue` is true then the key will be added with an empty value
     * to the `.env.template` file.
     */
    set(key: string, value: string | number | boolean, options?: {
        withEmptyTemplateValue: boolean;
    }): void;
    /**
     * Get files and their contents as JSON
     */
    toJSON(): {
        exists: boolean;
        contents: string[];
        filePath: string;
    }[];
    /**
     * Save changes back to the disk
     */
    save(): Promise<void>;
}
//# sourceMappingURL=env-editor.d.ts.map