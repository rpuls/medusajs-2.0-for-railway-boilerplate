import { RuleOperatorType } from "../../../common";
import { ShippingOptionPriceType } from "../../../fulfillment";
export interface AdminCreateShippingOptionRule {
    operator: RuleOperatorType;
    attribute: string;
    value: string | string[];
}
export interface AdminCreateShippingOptionType {
    label: string;
    description: string;
    code: string;
}
interface AdminShippingOptionPriceRulePayload {
    operator: string;
    attribute: string;
    value: string | string[] | number;
}
interface AdminShippingOptionPriceWithRules {
    rules?: AdminShippingOptionPriceRulePayload[];
}
export interface AdminCreateShippingOptionPriceWithCurrency extends AdminShippingOptionPriceWithRules {
    currency_code: string;
    amount: number;
}
export interface AdminCreateShippingOptionPriceWithRegion extends AdminShippingOptionPriceWithRules {
    region_id: string;
    amount: number;
}
export interface AdminCreateShippingOption {
    name: string;
    service_zone_id: string;
    shipping_profile_id: string;
    data?: Record<string, unknown>;
    price_type: ShippingOptionPriceType;
    provider_id: string;
    type: AdminCreateShippingOptionType;
    prices: (AdminCreateShippingOptionPriceWithCurrency | AdminCreateShippingOptionPriceWithRegion)[];
    rules?: AdminCreateShippingOptionRule[];
}
export interface AdminUpdateShippingOptionRule extends AdminCreateShippingOptionRule {
    id: string;
}
export interface AdminUpdateShippingOptionPriceWithCurrency extends AdminShippingOptionPriceWithRules {
    id?: string;
    currency_code?: string;
    amount?: number;
}
export interface AdminUpdateShippingOptionPriceWithRegion extends AdminShippingOptionPriceWithRules {
    id?: string;
    region_id?: string;
    amount?: number;
}
export interface AdminUpdateShippingOption {
    name?: string;
    data?: Record<string, unknown>;
    price_type?: ShippingOptionPriceType;
    provider_id?: string;
    shipping_profile_id?: string;
    type?: AdminCreateShippingOptionType;
    prices?: (AdminUpdateShippingOptionPriceWithCurrency | AdminUpdateShippingOptionPriceWithRegion)[];
    rules?: (AdminUpdateShippingOptionRule | AdminCreateShippingOptionRule)[];
}
export interface AdminUpdateShippingOptionRules {
    create?: any[];
    update?: any[];
    delete?: string[];
}
export {};
//# sourceMappingURL=payloads.d.ts.map