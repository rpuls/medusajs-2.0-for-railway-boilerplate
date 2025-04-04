import { Order } from "./order";
export declare const OrderSummary: import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
    version: import("@medusajs/framework/utils").NumberProperty;
    totals: import("@medusajs/framework/utils").JSONProperty;
    order: import("@medusajs/framework/utils").BelongsTo<() => typeof Order, undefined>;
}>, {
    readonly tableName: "order_summary";
    readonly name: "OrderSummary";
}>;
//# sourceMappingURL=order-summary.d.ts.map