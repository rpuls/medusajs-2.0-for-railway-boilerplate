export interface AdminCreateProductTag {
    /**
     * The tag's value.
     */
    value: string;
    /**
     * Key-value pairs of custom data.
     */
    metadata?: Record<string, unknown> | null;
}
export interface AdminUpdateProductTag {
    /**
     * The tag's value.
     */
    value?: string;
    /**
     * Key-value pairs of custom data.
     */
    metadata?: Record<string, unknown> | null;
}
//# sourceMappingURL=payloads.d.ts.map