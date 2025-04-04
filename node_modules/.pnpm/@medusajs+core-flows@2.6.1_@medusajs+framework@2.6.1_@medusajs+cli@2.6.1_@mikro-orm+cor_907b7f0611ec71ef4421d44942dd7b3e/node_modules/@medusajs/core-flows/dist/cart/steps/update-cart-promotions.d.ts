import { PromotionActions } from "@medusajs/framework/utils";
/**
 * The details of the promotion codes to apply on a cart.
 */
export interface UpdateCartPromotionStepInput {
    /**
     * The ID of the cart to update promotions for.
     */
    id: string;
    /**
     * The promotion codes to apply on the cart.
     */
    promo_codes?: string[];
    /**
     * Whether to add, remove, or replace promotion codes.
     */
    action?: PromotionActions.ADD | PromotionActions.REMOVE | PromotionActions.REPLACE;
}
export declare const updateCartPromotionsStepId = "update-cart-promotions";
/**
 * This step updates the promotions applied on a cart.
 */
export declare const updateCartPromotionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateCartPromotionStepInput, null>;
//# sourceMappingURL=update-cart-promotions.d.ts.map