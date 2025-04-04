import { OrderDetailDTO } from "@medusajs/framework/types";
/**
 * The data to retrieve an order's details.
 */
export type GetOrderDetailWorkflowInput = {
    /**
     * Additional filters to apply on the retrieved order.
     */
    filters?: {
        /**
         * Whether to retrieve a draft order.
         */
        is_draft_order?: boolean;
        /**
         * The ID of the customer that the order belongs to.
         */
        customer_id?: string;
    };
    /**
     * The fields and relations to retrieve in the order. These fields
     * are passed to [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
     * so you can pass names of custom models linked to the order.
     */
    fields: string[];
    /**
     * The ID of the order to retrieve.
     */
    order_id: string;
    /**
     * The version of the order to retrieve. If not provided, the latest version
     * of the order will be retrieved.
     */
    version?: number;
};
export declare const getOrderDetailWorkflowId = "get-order-detail";
/**
 * This workflow retrieves an order's details. It's used by many API routes, including
 * [Get an Order Admin API Route](https://docs.medusajs.com/api/admin#orders_getordersid), and
 * [Get an Order Store API Route](https://docs.medusajs.com/api/store#orders_getordersid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to retrieve an
 * order's details in your custom flows.
 *
 * @example
 * const { result } = await getOrderDetailWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     fields: ["id", "status", "items"]
 *   }
 * })
 *
 * @summary
 *
 * Retrieve an order's details.
 */
export declare const getOrderDetailWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<GetOrderDetailWorkflowInput, OrderDetailDTO, []>;
//# sourceMappingURL=get-order-detail.d.ts.map