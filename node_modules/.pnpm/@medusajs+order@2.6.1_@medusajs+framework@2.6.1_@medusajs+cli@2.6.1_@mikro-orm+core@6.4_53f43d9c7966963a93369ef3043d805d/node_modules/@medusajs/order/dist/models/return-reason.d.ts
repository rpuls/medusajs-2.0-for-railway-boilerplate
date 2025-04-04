declare const _ReturnReason: any;
export declare const ReturnReason: import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
    value: import("@medusajs/framework/utils").TextProperty;
    label: import("@medusajs/framework/utils").TextProperty;
    description: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
    metadata: import("@medusajs/framework/utils").NullableModifier<Record<string, unknown>, import("@medusajs/framework/utils").JSONProperty>;
    parent_return_reason: import("@medusajs/framework/utils").RelationNullableModifier<() => typeof _ReturnReason, import("@medusajs/framework/utils").BelongsTo<() => typeof _ReturnReason, undefined>, true>;
    return_reason_children: import("@medusajs/framework/utils").HasMany<() => typeof _ReturnReason>;
}>, "ReturnReason">;
export {};
//# sourceMappingURL=return-reason.d.ts.map