import { IndexMetadataStatus } from "../utils/index-metadata-status";
declare const IndexMetadata: import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
    entity: import("@medusajs/framework/utils").TextProperty;
    fields: import("@medusajs/framework/utils").TextProperty;
    fields_hash: import("@medusajs/framework/utils").TextProperty;
    status: import("@medusajs/framework/utils").EnumProperty<typeof IndexMetadataStatus>;
}>, "IndexMetadata">;
export default IndexMetadata;
//# sourceMappingURL=index-metadata.d.ts.map