declare const ApiKey: import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
    token: import("@medusajs/framework/utils").TextProperty;
    salt: import("@medusajs/framework/utils").TextProperty;
    redacted: import("@medusajs/framework/utils").TextProperty;
    title: import("@medusajs/framework/utils").TextProperty;
    type: import("@medusajs/framework/utils").EnumProperty<["publishable", "secret"]>;
    last_used_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
    created_by: import("@medusajs/framework/utils").TextProperty;
    revoked_by: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
    revoked_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
}>, "ApiKey">;
export default ApiKey;
//# sourceMappingURL=api-key.d.ts.map