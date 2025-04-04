declare const AccountHolder: import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
    provider_id: import("@medusajs/framework/utils").TextProperty;
    external_id: import("@medusajs/framework/utils").TextProperty;
    email: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
    data: import("@medusajs/framework/utils").JSONProperty;
    metadata: import("@medusajs/framework/utils").NullableModifier<Record<string, unknown>, import("@medusajs/framework/utils").JSONProperty>;
}>, "AccountHolder">;
export default AccountHolder;
//# sourceMappingURL=account-holder.d.ts.map