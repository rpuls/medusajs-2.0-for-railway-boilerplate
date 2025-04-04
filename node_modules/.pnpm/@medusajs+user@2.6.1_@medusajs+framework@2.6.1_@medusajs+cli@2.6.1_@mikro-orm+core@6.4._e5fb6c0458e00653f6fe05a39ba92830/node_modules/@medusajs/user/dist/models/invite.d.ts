export declare const Invite: import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
    email: import("@medusajs/framework/utils").TextProperty;
    accepted: import("@medusajs/framework/utils").BooleanProperty;
    token: import("@medusajs/framework/utils").TextProperty;
    expires_at: import("@medusajs/framework/utils").DateTimeProperty;
    metadata: import("@medusajs/framework/utils").NullableModifier<Record<string, unknown>, import("@medusajs/framework/utils").JSONProperty>;
}>, "invite">;
//# sourceMappingURL=invite.d.ts.map