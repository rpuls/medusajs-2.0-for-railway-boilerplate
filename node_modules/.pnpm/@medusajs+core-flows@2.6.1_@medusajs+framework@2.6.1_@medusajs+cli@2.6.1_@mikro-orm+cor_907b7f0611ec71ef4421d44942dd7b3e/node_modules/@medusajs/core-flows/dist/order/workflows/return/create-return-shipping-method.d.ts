import { BigNumberInput, OrderChangeDTO, OrderDTO, OrderPreviewDTO, ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a shipping method can be created for a return.
 */
export type CreateReturnShippingMethodValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
    /**
     * The return's details.
     */
    orderReturn: ReturnDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
};
/**
 * This step validates that a shipping method can be created for a return.
 * If the order or return is canceled, or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, return, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = createReturnShippingMethodValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderReturn: {
 *     id: "return_123",
 *     // other return details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 * })
 */
export declare const createReturnShippingMethodValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateReturnShippingMethodValidationStepInput, unknown>;
/**
 * The data to create a shipping method for a return.
 */
export type CreateReturnShippingMethodWorkflowInput = {
    /**
     * The ID of the return to create the shipping method for.
     */
    return_id: string;
    /**
     * The ID of the claim associated with the return, if any.
     */
    claim_id?: string;
    /**
     * The ID of the exchange associated with the return, if any.
     */
    exchange_id?: string;
    /**
     * The ID of the shipping option to create the shipping method from.
     */
    shipping_option_id: string;
    /**
     * The custom amount to charge for the shipping method.
     * If not provided, the amount from the shipping option will be used.
     */
    custom_amount?: BigNumberInput | null;
};
export declare const createReturnShippingMethodWorkflowId = "create-return-shipping-method";
/**
 * This workflow creates a shipping method for a return. It's used by the
 * [Add Shipping Method Store API Route](https://docs.medusajs.com/api/admin#returns_postreturnsidshippingmethod).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to create a shipping method for a return in your custom flows.
 *
 * @example
 * const { result } = await createReturnShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *     shipping_option_id: "so_123",
 *   }
 * })
 *
 * @summary
 *
 * Create a shipping method for a return.
 */
export declare const createReturnShippingMethodWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateReturnShippingMethodWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=create-return-shipping-method.d.ts.map