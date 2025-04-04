import { DALUtils } from "@medusajs/framework/utils";
declare const OrderRepository_base: new ({ manager }: {
    manager: any;
}) => DALUtils.MikroOrmBaseRepository<import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
    display_id: import("@medusajs/framework/utils").AutoIncrementProperty;
    region_id: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
    customer_id: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
    version: import("@medusajs/framework/utils").NumberProperty;
    sales_channel_id: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
    status: import("@medusajs/framework/utils").EnumProperty<typeof import("@medusajs/framework/utils").OrderStatus>;
    is_draft_order: import("@medusajs/framework/utils").BooleanProperty;
    email: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
    currency_code: import("@medusajs/framework/utils").TextProperty;
    no_notification: import("@medusajs/framework/utils").NullableModifier<boolean, import("@medusajs/framework/utils").BooleanProperty>;
    metadata: import("@medusajs/framework/utils").NullableModifier<Record<string, unknown>, import("@medusajs/framework/utils").JSONProperty>;
    canceled_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
    shipping_address: import("@medusajs/framework/utils").RelationNullableModifier<any, import("@medusajs/framework/utils").HasOneWithForeignKey<any, undefined>, true>;
    billing_address: import("@medusajs/framework/utils").RelationNullableModifier<any, import("@medusajs/framework/utils").HasOneWithForeignKey<any, undefined>, true>;
    summary: import("@medusajs/framework/utils").HasMany<any>;
    items: import("@medusajs/framework/utils").HasMany<any>;
    shipping_methods: import("@medusajs/framework/utils").HasMany<any>;
    transactions: import("@medusajs/framework/utils").HasMany<any>;
    credit_lines: import("@medusajs/framework/utils").HasMany<any>;
    returns: import("@medusajs/framework/utils").HasMany<any>;
}>, "Order">>;
export declare class OrderRepository extends OrderRepository_base {
}
export {};
//# sourceMappingURL=order.d.ts.map