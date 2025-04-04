import { UpdatePromotionDTO } from "@medusajs/framework/types";
export declare const updatePromotionsStepId = "update-promotions";
/**
 * This step updates one or more promotions.
 *
 * @example
 * const data = updatePromotionsStep([
 *   {
 *     id: "promo_123",
 *     code: "10OFF"
 *   }
 * ])
 */
export declare const updatePromotionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdatePromotionDTO[], import("@medusajs/framework/types").PromotionDTO[]>;
//# sourceMappingURL=update-promotions.d.ts.map