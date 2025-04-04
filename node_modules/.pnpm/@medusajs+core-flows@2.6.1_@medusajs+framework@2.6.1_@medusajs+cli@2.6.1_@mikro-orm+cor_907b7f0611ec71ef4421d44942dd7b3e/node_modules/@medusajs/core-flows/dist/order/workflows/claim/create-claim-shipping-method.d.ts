import { BigNumberInput, OrderChangeDTO, OrderClaimDTO, OrderDTO, OrderPreviewDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a shipping method can be created for a claim.
 */
export type CreateClaimShippingMethodValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
    /**
     * The order claim's details.
     */
    orderClaim: OrderClaimDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
};
/**
 * This step confirms that a shipping method can be created for a claim.
 * If the order or claim is canceled, or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, order claim, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = createClaimShippingMethodValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderClaim: {
 *     id: "claim_123",
 *     // other order claim details...
 *   },
 * })
 */
export declare const createClaimShippingMethodValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateClaimShippingMethodValidationStepInput, unknown>;
/**
 * The data to create a shipping method for a claim.
 */
export type CreateClaimShippingMethodWorkflowInput = {
    /**
     * The ID of the return associated with the claim.
     * If this is set, the shipping method will be created as an inbound (return) shipping method.
     * If not set, the shipping method will be created as an outbound (delivering new items) shipping method.
     */
    return_id?: string;
    /**
     * The ID of the claim to create the shipping method for.
     */
    claim_id?: string;
    /**
     * The ID of the shipping option to create the shipping method from.
     */
    shipping_option_id: string;
    /**
     * A custom amount to set for the shipping method. If not set, the shipping option's amount is used.
     */
    custom_amount?: BigNumberInput | null;
};
export declare const createClaimShippingMethodWorkflowId = "create-claim-shipping-method";
/**
 * This workflow creates an inbound (return) or outbound (delivering new items) shipping method for a claim.
 * It's used by the [Add Inbound Shipping Admin API Route](https://docs.medusajs.com/api/admin#claims_postclaimsidinboundshippingmethod),
 * and the [Add Outbound Shipping Admin API Route](https://docs.medusajs.com/api/admin#claims_postclaimsidoutboundshippingmethod).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to create a shipping method
 * for a claim in your custom flows.
 *
 * @example
 * To create an outbound shipping method for a claim:
 *
 * ```ts
 * const { result } = await createClaimShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     claim_id: "claim_123",
 *     shipping_option_id: "so_123",
 *   }
 * })
 * ```
 *
 * To create an inbound shipping method for a claim, specify the ID of the return associated with the claim:
 *
 * ```ts
 * const { result } = await createClaimShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     claim_id: "claim_123",
 *     return_id: "return_123",
 *     shipping_option_id: "so_123",
 *   }
 * })
 * ```
 *
 * @summary
 *
 * Create an inbound or outbound shipping method for a claim.
 */
export declare const createClaimShippingMethodWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateClaimShippingMethodWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=create-claim-shipping-method.d.ts.map