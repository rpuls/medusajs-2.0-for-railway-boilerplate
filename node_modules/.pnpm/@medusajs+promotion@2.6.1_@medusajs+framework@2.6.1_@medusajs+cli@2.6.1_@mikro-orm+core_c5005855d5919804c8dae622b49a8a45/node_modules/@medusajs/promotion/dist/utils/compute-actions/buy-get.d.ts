import { BigNumberInput, ComputeActionItemLine, PromotionTypes } from "@medusajs/framework/types";
export type EligibleItem = {
    item_id: string;
    quantity: BigNumberInput;
};
export declare function getComputedActionsForBuyGet(promotion: PromotionTypes.PromotionDTO, itemsContext: ComputeActionItemLine[], methodIdPromoValueMap: Map<string, BigNumberInput>, eligibleBuyItemMap: Map<string, EligibleItem[]>, eligibleTargetItemMap: Map<string, EligibleItem[]>): PromotionTypes.ComputeActions[];
export declare function sortByBuyGetType(a: any, b: any): 0 | 1 | -1;
//# sourceMappingURL=buy-get.d.ts.map