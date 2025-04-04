import { RuleOperator } from "@medusajs/framework/utils";
export declare enum DisguisedRule {
    APPLY_TO_QUANTITY = "apply_to_quantity",
    BUY_RULES_MIN_QUANTITY = "buy_rules_min_quantity",
    CURRENCY_CODE = "currency_code"
}
export declare const getRuleAttributesMap: ({ promotionType, applicationMethodType, }: {
    promotionType?: string;
    applicationMethodType?: string;
}) => {
    rules: {
        id: string;
        value: string;
        label: string;
        required: boolean;
        field_type: string;
        operators: ({
            id: RuleOperator;
            value: RuleOperator;
            label: string;
        } | {
            id: RuleOperator;
            value: RuleOperator;
            label: string;
        } | {
            id: RuleOperator;
            value: RuleOperator;
            label: string;
        })[];
    }[];
    "target-rules": {
        id: string;
        value: string;
        label: string;
        required: boolean;
        field_type: string;
        operators: ({
            id: RuleOperator;
            value: RuleOperator;
            label: string;
        } | {
            id: RuleOperator;
            value: RuleOperator;
            label: string;
        } | {
            id: RuleOperator;
            value: RuleOperator;
            label: string;
        })[];
    }[];
    "buy-rules": {
        id: string;
        value: string;
        label: string;
        required: boolean;
        field_type: string;
        operators: ({
            id: RuleOperator;
            value: RuleOperator;
            label: string;
        } | {
            id: RuleOperator;
            value: RuleOperator;
            label: string;
        } | {
            id: RuleOperator;
            value: RuleOperator;
            label: string;
        })[];
    }[];
};
//# sourceMappingURL=rule-attributes-map.d.ts.map