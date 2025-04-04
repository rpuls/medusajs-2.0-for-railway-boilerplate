import { PromotionActions } from "@medusajs/framework/utils";
/**
 * The details of the promotion codes to apply on a cart.
 */
export interface GetPromotionCodesToApplyStepInput {
    /**
     * The cart containing items and shipping methods.
     */
    cart: {
        /**
         * The cart's items and the promotion adjustments applied to them.
         */
        items?: {
            adjustments?: {
                code?: string;
            }[];
        }[];
        /**
         * The cart's shipping methods and the promotion adjustments applied to them.
         */
        shipping_methods?: {
            adjustments?: {
                code?: string;
            }[];
        }[];
    };
    /**
     * the promotion codes to be applied to the cart.
     */
    promo_codes?: string[];
    /**
     * Whether to add, remove, or replace promotion codes.
     */
    action?: PromotionActions.ADD | PromotionActions.REMOVE | PromotionActions.REPLACE;
}
/**
 * The promotion codes to apply on the cart.
 *
 * @example ["PRO10", "SHIPFREE", "NEWYEAR20"]
 */
export type GetPromotionCodesToApplyStepOutput = string[];
export declare const getPromotionCodesToApplyId = "get-promotion-codes-to-apply";
/**
 * This step retrieves the promotion codes to apply on a cart.
 *
 * @example
 * const data = getPromotionCodesToApply(
 *   {
 *     cart: {
 *       items: [
 *         {
 *           adjustments: [{ code: "PROMO10" }]
 *         }
 *       ],
 *       shipping_methods: [
 *         {
 *           adjustments: [{ code: "SHIPFREE" }]
 *         }
 *       ]
 *     },
 *     promo_codes: ["NEWYEAR20"],
 *     action: PromotionActions.ADD
 *   },
 * )
 */
export declare const getPromotionCodesToApply: import("@medusajs/framework/workflows-sdk").StepFunction<GetPromotionCodesToApplyStepInput, GetPromotionCodesToApplyStepOutput>;
//# sourceMappingURL=get-promotion-codes-to-apply.d.ts.map