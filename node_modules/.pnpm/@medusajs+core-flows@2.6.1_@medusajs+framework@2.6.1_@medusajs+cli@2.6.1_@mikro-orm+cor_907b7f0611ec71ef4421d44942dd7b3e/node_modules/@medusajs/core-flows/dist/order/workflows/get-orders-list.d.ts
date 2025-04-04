import { OrderDTO } from "@medusajs/framework/types";
/**
 * The retrieved list of orders. If you passed pagination configurations in the
 * input, the response will return an object that includes the list of
 * orders and their pagination details. Otherwise, only the list of orders are returned.
 */
export type GetOrdersListWorkflowOutput = OrderDTO[] | {
    /**
     * The list of orders.
     */
    rows: OrderDTO[];
    /**
     * Pagination details.
     */
    metadata: {
        /**
         * The total number of orders.
         */
        count: number;
        /**
         * The number of items skipped before retrieving the returned orders.
         */
        skip: number;
        /**
         * The number of items to retrieve.
         */
        take: number;
    };
};
export type GetOrdersListWorkflowInput = {
    /**
     * The fields and relations to retrieve in the order. These fields
     * are passed to [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
     * so you can pass names of custom models linked to the order.
     */
    fields: string[];
    /**
     * Filters and pagination configurations to apply on the retrieved orders.
     */
    variables?: Record<string, any> & {
        /**
         * The number of items to skip before retrieving the orders.
         */
        skip?: number;
        /**
         * The number of items to retrieve.
         */
        take?: number;
        /**
         * Fields to sort the orders by. The key is the field name, and the value is either
         * `ASC` for ascending order or `DESC` for descending order.
         */
        order?: Record<string, string>;
    };
};
export declare const getOrdersListWorkflowId = "get-orders-list";
/**
 * This workflow retrieves a list of orders. It's used by the
 * [List Orders Admin API Route](https://docs.medusajs.com/api/admin#orders_getorders), and the
 * [List Orders Store API Route](https://docs.medusajs.com/api/store#orders_getorders).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to retrieve a list of
 * orders in your custom flows. For example, you can retrieve the list of orders to export them
 * to a third-party system.
 *
 * @example
 * To retrieve the list of orders:
 *
 * ```ts
 * const { result } = await getOrdersListWorkflow(container)
 * .run({
 *   input: {
 *     fields: ["id", "status", "items"],
 *   }
 * })
 * ```
 *
 * To retrieve the list of orders with pagination:
 *
 * ```ts
 * const { result } = await getOrdersListWorkflow(container)
 * .run({
 *   input: {
 *     fields: ["id", "status", "items"],
 *     variables: {
 *       skip: 0,
 *       take: 15,
 *     }
 *   }
 * })
 * ```
 *
 * @summary
 *
 * Retrieve a list of orders.
 */
export declare const getOrdersListWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<GetOrdersListWorkflowInput, GetOrdersListWorkflowOutput, []>;
//# sourceMappingURL=get-orders-list.d.ts.map