import { BelongsTo, DmlEntity, DMLEntitySchemaBuilder, IdProperty, JSONProperty, NullableModifier, PrimaryKeyModifier, TextProperty } from "@medusajs/framework/utils";
import { ServiceZone } from "./service-zone";
export type GeoZoneSchema = {
    id: PrimaryKeyModifier<string, IdProperty>;
    type: TextProperty;
    country_code: TextProperty;
    province_code?: NullableModifier<string, TextProperty>;
    city?: NullableModifier<string, TextProperty>;
    postal_expression?: NullableModifier<Record<string, unknown>, JSONProperty>;
    service_zone: BelongsTo<() => typeof ServiceZone>;
    metadata?: NullableModifier<Record<string, unknown>, JSONProperty>;
};
export declare const GeoZone: DmlEntity<DMLEntitySchemaBuilder<GeoZoneSchema>, "GeoZone">;
//# sourceMappingURL=geo-zone.d.ts.map