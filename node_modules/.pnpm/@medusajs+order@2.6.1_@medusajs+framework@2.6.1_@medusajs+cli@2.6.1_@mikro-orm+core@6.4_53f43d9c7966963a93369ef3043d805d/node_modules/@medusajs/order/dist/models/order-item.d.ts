import { OrderLineItem } from "./line-item";
import { Order } from "./order";
export declare const OrderItem: import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
    version: import("@medusajs/framework/utils").NumberProperty;
    unit_price: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").BigNumberProperty>;
    compare_at_unit_price: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").BigNumberProperty>;
    quantity: import("@medusajs/framework/utils").BigNumberProperty;
    fulfilled_quantity: import("@medusajs/framework/utils").BigNumberProperty;
    delivered_quantity: import("@medusajs/framework/utils").BigNumberProperty;
    shipped_quantity: import("@medusajs/framework/utils").BigNumberProperty;
    return_requested_quantity: import("@medusajs/framework/utils").BigNumberProperty;
    return_received_quantity: import("@medusajs/framework/utils").BigNumberProperty;
    return_dismissed_quantity: import("@medusajs/framework/utils").BigNumberProperty;
    written_off_quantity: import("@medusajs/framework/utils").BigNumberProperty;
    metadata: import("@medusajs/framework/utils").NullableModifier<Record<string, unknown>, import("@medusajs/framework/utils").JSONProperty>;
    order: import("@medusajs/framework/utils").BelongsTo<() => typeof Order, undefined>;
    item: import("@medusajs/framework/utils").HasOneWithForeignKey<() => typeof OrderLineItem, undefined>;
}>, "OrderItem">;
//# sourceMappingURL=order-item.d.ts.map