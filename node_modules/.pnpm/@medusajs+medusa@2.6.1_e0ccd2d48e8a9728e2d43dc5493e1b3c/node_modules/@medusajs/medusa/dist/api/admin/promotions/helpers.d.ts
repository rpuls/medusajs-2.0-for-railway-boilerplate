import { BatchMethodResponse, BatchResponse, MedusaContainer, PromotionRuleDTO } from "@medusajs/framework/types";
export declare const refetchPromotion: (promotionId: string, scope: MedusaContainer, fields: string[]) => Promise<any>;
export declare const refetchBatchRules: (batchResult: BatchMethodResponse<PromotionRuleDTO>, scope: MedusaContainer, fields: string[]) => Promise<BatchResponse<PromotionRuleDTO>>;
//# sourceMappingURL=helpers.d.ts.map