declare const IndexRelation: import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
    id: import("@medusajs/framework/utils").PrimaryKeyModifier<number, import("@medusajs/framework/utils").AutoIncrementProperty>;
    pivot: import("@medusajs/framework/utils").TextProperty;
    parent_name: import("@medusajs/framework/utils").TextProperty;
    parent_id: import("@medusajs/framework/utils").TextProperty;
    child_name: import("@medusajs/framework/utils").TextProperty;
    child_id: import("@medusajs/framework/utils").TextProperty;
    staled_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
}>, "IndexRelation">;
export default IndexRelation;
//# sourceMappingURL=index-relation.d.ts.map