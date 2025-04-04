import { CreatePromotionRuleDTO, PromotionRuleTypes, UpdatePromotionRuleDTO } from "./common";
/**
 * The data to create rules for a promotion.
 */
export type AddPromotionRulesWorkflowDTO = {
    /**
     * The type of rules to create.
     */
    rule_type: PromotionRuleTypes;
    /**
     * The data to create the rules.
     */
    data: {
        /**
         * The ID of the promotion to create the rules for.
         */
        id: string;
        /**
         * The rules to create.
         */
        rules: CreatePromotionRuleDTO[];
    };
};
/**
 * The data to remove rules of a promotion.
 */
export type RemovePromotionRulesWorkflowDTO = {
    /**
     * The type of rules to remove.
     */
    rule_type: PromotionRuleTypes;
    /**
     * The data to remove the rules.
     */
    data: {
        /**
         * The ID of the promotion to remove its rules.
         */
        id: string;
        /**
         * The IDs of the rules to remove.
         */
        rule_ids: string[];
    };
};
/**
 * The data to update promotion rules.
 */
export type UpdatePromotionRulesWorkflowDTO = {
    /**
     * The promotion rules to update.
     */
    data: UpdatePromotionRuleDTO[];
};
//# sourceMappingURL=workflows.d.ts.map