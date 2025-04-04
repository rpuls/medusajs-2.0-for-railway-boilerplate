import { Context } from "@medusajs/framework/types";
import { BigNumber } from "@medusajs/framework/utils";
import { InventoryLevelRepository } from "../repositories";
type InjectedDependencies = {
    inventoryLevelRepository: InventoryLevelRepository;
};
declare const InventoryLevelService_base: new (container: InjectedDependencies) => import("@medusajs/framework/types").IMedusaInternalService<import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
    location_id: import("@medusajs/framework/utils").TextProperty;
    stocked_quantity: import("@medusajs/framework/utils").BigNumberProperty;
    reserved_quantity: import("@medusajs/framework/utils").BigNumberProperty;
    incoming_quantity: import("@medusajs/framework/utils").BigNumberProperty;
    metadata: import("@medusajs/framework/utils").NullableModifier<Record<string, unknown>, import("@medusajs/framework/utils").JSONProperty>;
    inventory_item: import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
        id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
        sku: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
        origin_country: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
        hs_code: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
        mid_code: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
        material: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
        weight: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").NumberProperty>;
        length: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").NumberProperty>;
        height: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").NumberProperty>;
        width: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").NumberProperty>;
        requires_shipping: import("@medusajs/framework/utils").BooleanProperty;
        description: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
        title: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
        thumbnail: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
        metadata: import("@medusajs/framework/utils").NullableModifier<Record<string, unknown>, import("@medusajs/framework/utils").JSONProperty>;
        location_levels: import("@medusajs/framework/utils").HasMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, "InventoryLevel">>;
        reservation_items: import("@medusajs/framework/utils").HasMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
            id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
            line_item_id: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
            allow_backorder: import("@medusajs/framework/utils").BooleanProperty;
            location_id: import("@medusajs/framework/utils").TextProperty;
            quantity: import("@medusajs/framework/utils").BigNumberProperty;
            raw_quantity: import("@medusajs/framework/utils").JSONProperty;
            external_id: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
            description: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
            created_by: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
            metadata: import("@medusajs/framework/utils").NullableModifier<Record<string, unknown>, import("@medusajs/framework/utils").JSONProperty>;
            inventory_item: import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, "InventoryItem">, undefined>;
        }>, "ReservationItem">>;
        reserved_quantity: import("@medusajs/framework/utils").ComputedProperty<number | null, import("@medusajs/framework/utils").NumberProperty>;
        stocked_quantity: import("@medusajs/framework/utils").ComputedProperty<number | null, import("@medusajs/framework/utils").NumberProperty>;
    }>, "InventoryItem">, undefined>;
    available_quantity: import("@medusajs/framework/utils").ComputedProperty<number | null, import("@medusajs/framework/utils").BigNumberProperty>;
}>, "InventoryLevel">, InjectedDependencies>;
export default class InventoryLevelService extends InventoryLevelService_base {
    protected readonly inventoryLevelRepository: InventoryLevelRepository;
    constructor(container: InjectedDependencies);
    retrieveStockedQuantity(inventoryItemId: string, locationIds: string[] | string, context?: Context): Promise<BigNumber>;
    getAvailableQuantity(inventoryItemId: string, locationIds: string[] | string, context?: Context): Promise<BigNumber>;
    getReservedQuantity(inventoryItemId: string, locationIds: string[] | string, context?: Context): Promise<BigNumber>;
}
export {};
//# sourceMappingURL=inventory-level.d.ts.map