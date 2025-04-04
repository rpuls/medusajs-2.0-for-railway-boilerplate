import { PricingRuleOperator, RuleOperator, ShippingOptionPriceType as ShippingOptionPriceTypeEnum } from "@medusajs/framework/utils";
import { z } from "zod";
export type AdminGetShippingOptionParamsType = z.infer<typeof AdminGetShippingOptionParams>;
export declare const AdminGetShippingOptionParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export type AdminGetShippingOptionsParamsType = z.infer<typeof AdminGetShippingOptionsParams>;
export declare const AdminGetShippingOptionsParams: z.ZodObject<{
    order: z.ZodOptional<z.ZodString> | z.ZodDefault<z.ZodOptional<z.ZodString>>;
    fields: z.ZodOptional<z.ZodString>;
    offset: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodNumber>>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodNumber>>, number, unknown>;
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    q: z.ZodOptional<z.ZodString>;
    service_zone_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    shipping_profile_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    provider_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    stock_location_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    is_return: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
    admin_only: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
    shipping_option_type_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    created_at: z.ZodOptional<z.ZodUnion<[any, z.ZodObject<{
        $eq: any;
        $ne: any;
        $in: any;
        $nin: any;
        $like: any;
        $ilike: any;
        $re: any;
        $contains: any;
        $gt: any;
        $gte: any;
        $lt: any;
        $lte: any;
    }, "strip", z.ZodTypeAny, {
        $eq?: any;
        $ne?: any;
        $in?: any;
        $nin?: any;
        $like?: any;
        $ilike?: any;
        $re?: any;
        $contains?: any;
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }, {
        $eq?: any;
        $ne?: any;
        $in?: any;
        $nin?: any;
        $like?: any;
        $ilike?: any;
        $re?: any;
        $contains?: any;
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }>]>>;
    updated_at: z.ZodOptional<z.ZodUnion<[any, z.ZodObject<{
        $eq: any;
        $ne: any;
        $in: any;
        $nin: any;
        $like: any;
        $ilike: any;
        $re: any;
        $contains: any;
        $gt: any;
        $gte: any;
        $lt: any;
        $lte: any;
    }, "strip", z.ZodTypeAny, {
        $eq?: any;
        $ne?: any;
        $in?: any;
        $nin?: any;
        $like?: any;
        $ilike?: any;
        $re?: any;
        $contains?: any;
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }, {
        $eq?: any;
        $ne?: any;
        $in?: any;
        $nin?: any;
        $like?: any;
        $ilike?: any;
        $re?: any;
        $contains?: any;
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }>]>>;
    deleted_at: z.ZodOptional<z.ZodUnion<[any, z.ZodObject<{
        $eq: any;
        $ne: any;
        $in: any;
        $nin: any;
        $like: any;
        $ilike: any;
        $re: any;
        $contains: any;
        $gt: any;
        $gte: any;
        $lt: any;
        $lte: any;
    }, "strip", z.ZodTypeAny, {
        $eq?: any;
        $ne?: any;
        $in?: any;
        $nin?: any;
        $like?: any;
        $ilike?: any;
        $re?: any;
        $contains?: any;
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }, {
        $eq?: any;
        $ne?: any;
        $in?: any;
        $nin?: any;
        $like?: any;
        $ilike?: any;
        $re?: any;
        $contains?: any;
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }>]>>;
}, "strip", z.ZodTypeAny, {
    offset: number;
    limit: number;
    order?: string | undefined;
    fields?: string | undefined;
    id?: string | string[] | undefined;
    q?: string | undefined;
    service_zone_id?: string | string[] | undefined;
    shipping_profile_id?: string | string[] | undefined;
    provider_id?: string | string[] | undefined;
    stock_location_id?: string | string[] | undefined;
    is_return?: boolean | undefined;
    admin_only?: boolean | undefined;
    shipping_option_type_id?: string | string[] | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}, {
    order?: string | undefined;
    fields?: string | undefined;
    offset?: unknown;
    limit?: unknown;
    id?: string | string[] | undefined;
    q?: string | undefined;
    service_zone_id?: string | string[] | undefined;
    shipping_profile_id?: string | string[] | undefined;
    provider_id?: string | string[] | undefined;
    stock_location_id?: string | string[] | undefined;
    is_return?: string | boolean | undefined;
    admin_only?: string | boolean | undefined;
    shipping_option_type_id?: string | string[] | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}>;
/**
 * SHIPPING OPTIONS RULES
 */
export type AdminGetShippingOptionRuleParamsType = z.infer<typeof AdminGetShippingOptionRuleParams>;
export declare const AdminGetShippingOptionRuleParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export type AdminCreateShippingOptionRuleType = z.infer<typeof AdminCreateShippingOptionRule>;
export declare const AdminCreateShippingOptionRule: z.ZodObject<{
    operator: z.ZodNativeEnum<typeof RuleOperator>;
    attribute: z.ZodString;
    value: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
}, "strict", z.ZodTypeAny, {
    value: (string | string[]) & (string | string[] | undefined);
    attribute: string;
    operator: RuleOperator;
}, {
    value: (string | string[]) & (string | string[] | undefined);
    attribute: string;
    operator: RuleOperator;
}>;
export type AdminUpdateShippingOptionRuleType = z.infer<typeof AdminUpdateShippingOptionRule>;
export declare const AdminUpdateShippingOptionRule: z.ZodObject<{
    id: z.ZodString;
    operator: z.ZodNativeEnum<typeof RuleOperator>;
    attribute: z.ZodString;
    value: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
}, "strict", z.ZodTypeAny, {
    id: string;
    value: (string | string[]) & (string | string[] | undefined);
    attribute: string;
    operator: RuleOperator;
}, {
    id: string;
    value: (string | string[]) & (string | string[] | undefined);
    attribute: string;
    operator: RuleOperator;
}>;
/**
 * SHIPPING OPTIONS
 */
export declare const AdminCreateShippingOptionTypeObject: z.ZodObject<{
    label: z.ZodString;
    description: z.ZodString;
    code: z.ZodString;
}, "strict", z.ZodTypeAny, {
    description: string;
    code: string;
    label: string;
}, {
    description: string;
    code: string;
    label: string;
}>;
export declare const AdminCreateShippingOptionPriceWithCurrency: z.ZodObject<{
    currency_code: z.ZodString;
    amount: z.ZodNumber;
    rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
        attribute: z.ZodLiteral<"item_total">;
        operator: z.ZodNativeEnum<typeof PricingRuleOperator>;
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        attribute: "item_total";
        operator: PricingRuleOperator;
    }, {
        value: number;
        attribute: "item_total";
        operator: PricingRuleOperator;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    amount: number;
    currency_code: string;
    rules?: {
        value: number;
        attribute: "item_total";
        operator: PricingRuleOperator;
    }[] | undefined;
}, {
    amount: number;
    currency_code: string;
    rules?: {
        value: number;
        attribute: "item_total";
        operator: PricingRuleOperator;
    }[] | undefined;
}>;
export declare const AdminCreateShippingOptionPriceWithRegion: z.ZodObject<{
    region_id: z.ZodString;
    amount: z.ZodNumber;
    rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
        attribute: z.ZodLiteral<"item_total">;
        operator: z.ZodNativeEnum<typeof PricingRuleOperator>;
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        attribute: "item_total";
        operator: PricingRuleOperator;
    }, {
        value: number;
        attribute: "item_total";
        operator: PricingRuleOperator;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    amount: number;
    region_id: string;
    rules?: {
        value: number;
        attribute: "item_total";
        operator: PricingRuleOperator;
    }[] | undefined;
}, {
    amount: number;
    region_id: string;
    rules?: {
        value: number;
        attribute: "item_total";
        operator: PricingRuleOperator;
    }[] | undefined;
}>;
export declare const AdminUpdateShippingOptionPriceWithCurrency: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    currency_code: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
        attribute: z.ZodLiteral<"item_total">;
        operator: z.ZodNativeEnum<typeof PricingRuleOperator>;
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        attribute: "item_total";
        operator: PricingRuleOperator;
    }, {
        value: number;
        attribute: "item_total";
        operator: PricingRuleOperator;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    id?: string | undefined;
    currency_code?: string | undefined;
    amount?: number | undefined;
    rules?: {
        value: number;
        attribute: "item_total";
        operator: PricingRuleOperator;
    }[] | undefined;
}, {
    id?: string | undefined;
    currency_code?: string | undefined;
    amount?: number | undefined;
    rules?: {
        value: number;
        attribute: "item_total";
        operator: PricingRuleOperator;
    }[] | undefined;
}>;
export declare const AdminUpdateShippingOptionPriceWithRegion: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    region_id: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
        attribute: z.ZodLiteral<"item_total">;
        operator: z.ZodNativeEnum<typeof PricingRuleOperator>;
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        attribute: "item_total";
        operator: PricingRuleOperator;
    }, {
        value: number;
        attribute: "item_total";
        operator: PricingRuleOperator;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    id?: string | undefined;
    region_id?: string | undefined;
    amount?: number | undefined;
    rules?: {
        value: number;
        attribute: "item_total";
        operator: PricingRuleOperator;
    }[] | undefined;
}, {
    id?: string | undefined;
    region_id?: string | undefined;
    amount?: number | undefined;
    rules?: {
        value: number;
        attribute: "item_total";
        operator: PricingRuleOperator;
    }[] | undefined;
}>;
export type AdminCreateShippingOptionType = z.infer<typeof AdminCreateShippingOption>;
export declare const AdminCreateShippingOption: z.ZodObject<{
    name: z.ZodString;
    service_zone_id: z.ZodString;
    shipping_profile_id: z.ZodString;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    price_type: z.ZodNativeEnum<typeof ShippingOptionPriceTypeEnum>;
    provider_id: z.ZodString;
    type: z.ZodObject<{
        label: z.ZodString;
        description: z.ZodString;
        code: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        description: string;
        code: string;
        label: string;
    }, {
        description: string;
        code: string;
        label: string;
    }>;
    prices: z.ZodArray<z.ZodUnion<[z.ZodObject<{
        currency_code: z.ZodString;
        amount: z.ZodNumber;
        rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
            attribute: z.ZodLiteral<"item_total">;
            operator: z.ZodNativeEnum<typeof PricingRuleOperator>;
            value: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }, {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }>, "many">>;
    }, "strict", z.ZodTypeAny, {
        amount: number;
        currency_code: string;
        rules?: {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }[] | undefined;
    }, {
        amount: number;
        currency_code: string;
        rules?: {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }[] | undefined;
    }>, z.ZodObject<{
        region_id: z.ZodString;
        amount: z.ZodNumber;
        rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
            attribute: z.ZodLiteral<"item_total">;
            operator: z.ZodNativeEnum<typeof PricingRuleOperator>;
            value: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }, {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }>, "many">>;
    }, "strict", z.ZodTypeAny, {
        amount: number;
        region_id: string;
        rules?: {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }[] | undefined;
    }, {
        amount: number;
        region_id: string;
        rules?: {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }[] | undefined;
    }>]>, "many">;
    rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
        operator: z.ZodNativeEnum<typeof RuleOperator>;
        attribute: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    }, "strict", z.ZodTypeAny, {
        value: (string | string[]) & (string | string[] | undefined);
        attribute: string;
        operator: RuleOperator;
    }, {
        value: (string | string[]) & (string | string[] | undefined);
        attribute: string;
        operator: RuleOperator;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    name: string;
    provider_id: string;
    prices: ({
        amount: number;
        currency_code: string;
        rules?: {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }[] | undefined;
    } | {
        amount: number;
        region_id: string;
        rules?: {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }[] | undefined;
    })[];
    service_zone_id: string;
    shipping_profile_id: string;
    type: {
        description: string;
        code: string;
        label: string;
    };
    price_type: ShippingOptionPriceTypeEnum;
    data?: Record<string, unknown> | undefined;
    rules?: {
        value: (string | string[]) & (string | string[] | undefined);
        attribute: string;
        operator: RuleOperator;
    }[] | undefined;
}, {
    name: string;
    provider_id: string;
    prices: ({
        amount: number;
        currency_code: string;
        rules?: {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }[] | undefined;
    } | {
        amount: number;
        region_id: string;
        rules?: {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }[] | undefined;
    })[];
    service_zone_id: string;
    shipping_profile_id: string;
    type: {
        description: string;
        code: string;
        label: string;
    };
    price_type: ShippingOptionPriceTypeEnum;
    data?: Record<string, unknown> | undefined;
    rules?: {
        value: (string | string[]) & (string | string[] | undefined);
        attribute: string;
        operator: RuleOperator;
    }[] | undefined;
}>;
export type AdminUpdateShippingOptionType = z.infer<typeof AdminUpdateShippingOption>;
export declare const AdminUpdateShippingOption: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    price_type: z.ZodOptional<z.ZodNativeEnum<typeof ShippingOptionPriceTypeEnum>>;
    provider_id: z.ZodOptional<z.ZodString>;
    shipping_profile_id: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodObject<{
        label: z.ZodString;
        description: z.ZodString;
        code: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        description: string;
        code: string;
        label: string;
    }, {
        description: string;
        code: string;
        label: string;
    }>>;
    prices: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        currency_code: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodNumber>;
        rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
            attribute: z.ZodLiteral<"item_total">;
            operator: z.ZodNativeEnum<typeof PricingRuleOperator>;
            value: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }, {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }>, "many">>;
    }, "strict", z.ZodTypeAny, {
        id?: string | undefined;
        currency_code?: string | undefined;
        amount?: number | undefined;
        rules?: {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }[] | undefined;
    }, {
        id?: string | undefined;
        currency_code?: string | undefined;
        amount?: number | undefined;
        rules?: {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }[] | undefined;
    }>, z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        region_id: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodNumber>;
        rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
            attribute: z.ZodLiteral<"item_total">;
            operator: z.ZodNativeEnum<typeof PricingRuleOperator>;
            value: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }, {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }>, "many">>;
    }, "strict", z.ZodTypeAny, {
        id?: string | undefined;
        region_id?: string | undefined;
        amount?: number | undefined;
        rules?: {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }[] | undefined;
    }, {
        id?: string | undefined;
        region_id?: string | undefined;
        amount?: number | undefined;
        rules?: {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }[] | undefined;
    }>]>, "many">>;
    rules: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
        id: z.ZodString;
        operator: z.ZodNativeEnum<typeof RuleOperator>;
        attribute: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    }, "strict", z.ZodTypeAny, {
        id: string;
        value: (string | string[]) & (string | string[] | undefined);
        attribute: string;
        operator: RuleOperator;
    }, {
        id: string;
        value: (string | string[]) & (string | string[] | undefined);
        attribute: string;
        operator: RuleOperator;
    }>, z.ZodObject<{
        operator: z.ZodNativeEnum<typeof RuleOperator>;
        attribute: z.ZodString;
        value: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    }, "strict", z.ZodTypeAny, {
        value: (string | string[]) & (string | string[] | undefined);
        attribute: string;
        operator: RuleOperator;
    }, {
        value: (string | string[]) & (string | string[] | undefined);
        attribute: string;
        operator: RuleOperator;
    }>]>, "many">>;
}, "strict", z.ZodTypeAny, {
    name?: string | undefined;
    data?: Record<string, unknown> | undefined;
    price_type?: ShippingOptionPriceTypeEnum | undefined;
    provider_id?: string | undefined;
    shipping_profile_id?: string | undefined;
    type?: {
        description: string;
        code: string;
        label: string;
    } | undefined;
    prices?: ({
        id?: string | undefined;
        currency_code?: string | undefined;
        amount?: number | undefined;
        rules?: {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }[] | undefined;
    } | {
        id?: string | undefined;
        region_id?: string | undefined;
        amount?: number | undefined;
        rules?: {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }[] | undefined;
    })[] | undefined;
    rules?: ({
        value: (string | string[]) & (string | string[] | undefined);
        attribute: string;
        operator: RuleOperator;
    } | {
        id: string;
        value: (string | string[]) & (string | string[] | undefined);
        attribute: string;
        operator: RuleOperator;
    })[] | undefined;
}, {
    name?: string | undefined;
    data?: Record<string, unknown> | undefined;
    price_type?: ShippingOptionPriceTypeEnum | undefined;
    provider_id?: string | undefined;
    shipping_profile_id?: string | undefined;
    type?: {
        description: string;
        code: string;
        label: string;
    } | undefined;
    prices?: ({
        id?: string | undefined;
        currency_code?: string | undefined;
        amount?: number | undefined;
        rules?: {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }[] | undefined;
    } | {
        id?: string | undefined;
        region_id?: string | undefined;
        amount?: number | undefined;
        rules?: {
            value: number;
            attribute: "item_total";
            operator: PricingRuleOperator;
        }[] | undefined;
    })[] | undefined;
    rules?: ({
        value: (string | string[]) & (string | string[] | undefined);
        attribute: string;
        operator: RuleOperator;
    } | {
        id: string;
        value: (string | string[]) & (string | string[] | undefined);
        attribute: string;
        operator: RuleOperator;
    })[] | undefined;
}>;
//# sourceMappingURL=validators.d.ts.map