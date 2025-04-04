import { Context, DAL, FindConfig, InferEntityType, OrderTypes, RepositoryService } from "@medusajs/framework/types";
import { Order } from "../models";
type InjectedDependencies = {
    orderRepository: DAL.RepositoryService;
};
declare const OrderService_base: new (container: InjectedDependencies) => import("@medusajs/framework/types").IMedusaInternalService<{
    id: string;
    display_id: number;
    region_id: string | null;
    customer_id: string | null;
    version: number;
    sales_channel_id: string | null;
    status: import("@medusajs/framework/utils").OrderStatus;
    is_draft_order: boolean;
    email: string | null;
    currency_code: string;
    no_notification: boolean | null;
    metadata: Record<string, unknown> | null;
    canceled_at: Date | null;
    shipping_address: {
        [x: string]: any;
    } | null;
    billing_address: {
        [x: string]: any;
    } | null;
    summary: {
        [x: string]: any;
    }[];
    items: {
        [x: string]: any;
    }[];
    shipping_methods: {
        [x: string]: any;
    }[];
    transactions: {
        [x: string]: any;
    }[];
    credit_lines: {
        [x: string]: any;
    }[];
    returns: {
        [x: string]: any;
    }[];
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
    shipping_address_id: string | null;
    billing_address_id: string | null;
}, InjectedDependencies>;
export default class OrderService extends OrderService_base {
    protected readonly orderRepository_: RepositoryService<InferEntityType<typeof Order>>;
    constructor(container: InjectedDependencies);
    retrieveOrderVersion<TEntityMethod = OrderTypes.OrderDTO>(id: string, version: number, config?: FindConfig<TEntityMethod>, sharedContext?: Context): Promise<typeof Order>;
}
export {};
//# sourceMappingURL=order-service.d.ts.map