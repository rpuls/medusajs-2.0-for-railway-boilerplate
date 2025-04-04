import { OrderDTO, OrderWorkflow } from "@medusajs/framework/types";
import { CustomerDTO, OrderPreviewDTO } from "@medusajs/types";
/**
 * The details of the order transfer request to validate.
 */
export type RequestOrderTransferValidationStepInput = {
    /**
     * The order to transfer.
     */
    order: OrderDTO;
    /**
     * The customer to transfer the order to.
     */
    customer: CustomerDTO;
};
/**
 * This step validates that an order transfer can be requested. If the customer
 * is a guest customer, or the order already belongs to a registered customer,
 * the step throws an error.
 *
 * :::note
 *
 * You can retrieve an order and customer details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = requestOrderTransferValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   customer: {
 *     id: "customer_123",
 *     // other customer details...
 *   }
 * })
 */
export declare const requestOrderTransferValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<RequestOrderTransferValidationStepInput, unknown>;
export declare const requestOrderTransferWorkflowId = "request-order-transfer-workflow";
/**
 * This workflow requests an order transfer from a guest customer to a registered customer. It can be requested by an admin user or a customer.
 * If a customer requested the transfer, the `logged_in_user` input property should be the same as the customer's ID.
 *
 * This workflow is used by the [Request Order Transfer Store API Route](https://docs.medusajs.com/api/store#orders_postordersidtransferrequest),
 * and the [Request Order Transfer Admin API Route](https://docs.medusajs.com/api/admin#orders_postordersidtransfer).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to build a custom flow around requesting an order transfer.
 *
 * @example
 * const { result } = await requestOrderTransferWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     customer_id: "customer_123",
 *     logged_in_user: "user_123",
 *   }
 * })
 *
 * @summary
 *
 * Request a transfer of an order to a customer.
 */
export declare const requestOrderTransferWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.RequestOrderTransferWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=request-order-transfer.d.ts.map