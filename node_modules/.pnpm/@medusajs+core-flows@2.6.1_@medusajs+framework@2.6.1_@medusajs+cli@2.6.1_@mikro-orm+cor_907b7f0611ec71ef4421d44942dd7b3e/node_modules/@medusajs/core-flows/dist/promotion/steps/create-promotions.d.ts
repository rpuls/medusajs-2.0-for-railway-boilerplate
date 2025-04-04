import { CreatePromotionDTO } from "@medusajs/framework/types";
export declare const createPromotionsStepId = "create-promotions";
/**
 * This step creates one or more promotions.
 *
 * @example
 * const data = createPromotionsStep([
 *   {
 *     code: "10OFF",
 *     type: "standard",
 *     application_method: {
 *       type: "percentage",
 *       value: 10,
 *       target_type: "items"
 *     }
 *   }
 * ])
 */
export declare const createPromotionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreatePromotionDTO[], import("@medusajs/framework/types").PromotionDTO[]>;
//# sourceMappingURL=create-promotions.d.ts.map