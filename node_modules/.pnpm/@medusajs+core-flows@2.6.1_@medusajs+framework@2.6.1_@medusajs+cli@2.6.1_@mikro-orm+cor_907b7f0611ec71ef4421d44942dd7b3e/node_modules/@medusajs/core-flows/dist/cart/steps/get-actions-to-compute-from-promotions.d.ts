import { CartDTO } from "@medusajs/framework/types";
/**
 * The details of the cart and its applied promotions.
 */
export interface GetActionsToComputeFromPromotionsStepInput {
    /**
     * The cart to compute the actions for.
     */
    cart: CartDTO;
    /**
     * The promotion codes applied on the cart.
     */
    promotionCodesToApply: string[];
}
export declare const getActionsToComputeFromPromotionsStepId = "get-actions-to-compute-from-promotions";
/**
 * This step retrieves the actions to compute based on the promotions
 * applied on a cart.
 *
 * :::tip
 *
 * You can use the {@link retrieveCartStep} to retrieve a cart's details.
 *
 * :::
 *
 * @example
 * const data = getActionsToComputeFromPromotionsStep({
 *   // retrieve the details of the cart from another workflow
 *   // or in another step using the Cart Module's service
 *   cart,
 *   promotionCodesToApply: ["10OFF"]
 * })
 */
export declare const getActionsToComputeFromPromotionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<GetActionsToComputeFromPromotionsStepInput, import("@medusajs/framework/types").ComputeActions[]>;
//# sourceMappingURL=get-actions-to-compute-from-promotions.d.ts.map