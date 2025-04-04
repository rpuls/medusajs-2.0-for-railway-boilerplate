import { BigNumberInput, PromotionTypes } from "@medusajs/framework/types";
import { ApplicationMethodTargetType } from "@medusajs/framework/utils";
export declare function getComputedActionsForShippingMethods(promotion: PromotionTypes.PromotionDTO, shippingMethodApplicationContext: PromotionTypes.ComputeActionContext[ApplicationMethodTargetType.SHIPPING_METHODS], methodIdPromoValueMap: Map<string, number>): PromotionTypes.ComputeActions[];
export declare function applyPromotionToShippingMethods(promotion: PromotionTypes.PromotionDTO, shippingMethods: PromotionTypes.ComputeActionContext[ApplicationMethodTargetType.SHIPPING_METHODS], methodIdPromoValueMap: Map<string, BigNumberInput>): PromotionTypes.ComputeActions[];
//# sourceMappingURL=shipping-methods.d.ts.map