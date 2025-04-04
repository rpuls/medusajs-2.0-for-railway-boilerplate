import { BelongsTo, DmlEntity, DMLEntitySchemaBuilder, HasMany, IdProperty, JSONProperty, NullableModifier, PrimaryKeyModifier, TextProperty } from "@medusajs/framework/utils";
import { FulfillmentSet } from "./fulfillment-set";
import { GeoZone } from "./geo-zone";
import { ShippingOption } from "./shipping-option";
export type ServiceZoneSchema = {
    id: PrimaryKeyModifier<string, IdProperty>;
    name: TextProperty;
    fulfillment_set: BelongsTo<() => typeof FulfillmentSet>;
    geo_zones: HasMany<() => typeof GeoZone>;
    shipping_options: HasMany<() => typeof ShippingOption>;
    metadata: NullableModifier<Record<string, unknown>, JSONProperty>;
};
export declare const ServiceZone: DmlEntity<DMLEntitySchemaBuilder<ServiceZoneSchema>, "ServiceZone">;
//# sourceMappingURL=service-zone.d.ts.map