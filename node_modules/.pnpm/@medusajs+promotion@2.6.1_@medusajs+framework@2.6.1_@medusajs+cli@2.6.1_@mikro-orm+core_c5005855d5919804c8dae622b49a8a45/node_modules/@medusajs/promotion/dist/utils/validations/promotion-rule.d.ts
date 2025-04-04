import { ApplicationMethodTargetTypeValues, PromotionRuleDTO } from "@medusajs/framework/types";
import { CreatePromotionRuleDTO } from "../../types";
export declare function validatePromotionRuleAttributes(promotionRulesData: CreatePromotionRuleDTO[]): void;
export declare function areRulesValidForContext(rules: PromotionRuleDTO[], context: Record<string, any>, contextScope: ApplicationMethodTargetTypeValues): boolean;
export declare function evaluateRuleValueCondition(ruleValues: string[], operator: string, ruleValuesToCheck: (string | number)[] | (string | number)): boolean;
//# sourceMappingURL=promotion-rule.d.ts.map