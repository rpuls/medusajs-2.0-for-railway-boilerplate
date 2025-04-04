import { CampaignBudgetType } from "@medusajs/framework/utils";
import { z } from "zod";
export declare const AdminGetCampaignParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export declare const AdminGetCampaignsParamsFields: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    campaign_identifier: z.ZodOptional<z.ZodString>;
    budget: z.ZodOptional<z.ZodObject<{
        currency_code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        currency_code?: string | undefined;
    }, {
        currency_code?: string | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    q?: string | undefined;
    campaign_identifier?: string | undefined;
    budget?: {
        currency_code?: string | undefined;
    } | undefined;
}, {
    q?: string | undefined;
    campaign_identifier?: string | undefined;
    budget?: {
        currency_code?: string | undefined;
    } | undefined;
}>;
export type AdminGetCampaignsParamsType = z.infer<typeof AdminGetCampaignsParams>;
export declare const AdminGetCampaignsParams: z.ZodObject<{
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    $and: z.ZodOptional<z.ZodLazy<z.ZodArray<z.ZodObject<any, z.UnknownKeysParam, z.ZodTypeAny, {
        [x: string]: any;
    }, {
        [x: string]: any;
    }>, "many">>>;
    $or: z.ZodOptional<z.ZodLazy<z.ZodArray<z.ZodObject<any, z.UnknownKeysParam, z.ZodTypeAny, {
        [x: string]: any;
    }, {
        [x: string]: any;
    }>, "many">>>;
}, "strict", z.ZodTypeAny, {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    $and?: {
        [x: string]: any;
    }[] | undefined;
    $or?: {
        [x: string]: any;
    }[] | undefined;
}, {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    $and?: {
        [x: string]: any;
    }[] | undefined;
    $or?: {
        [x: string]: any;
    }[] | undefined;
}>;
export declare const UpdateCampaignBudget: z.ZodObject<{
    limit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strict", z.ZodTypeAny, {
    limit?: number | null | undefined;
}, {
    limit?: number | null | undefined;
}>;
export type AdminCreateCampaignType = z.infer<typeof CreateCampaign>;
export declare const CreateCampaign: z.ZodObject<{
    name: z.ZodString;
    campaign_identifier: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    budget: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        type: z.ZodNativeEnum<typeof CampaignBudgetType>;
        limit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        currency_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strict", z.ZodTypeAny, {
        type: CampaignBudgetType;
        limit?: number | null | undefined;
        currency_code?: string | null | undefined;
    }, {
        type: CampaignBudgetType;
        limit?: number | null | undefined;
        currency_code?: string | null | undefined;
    }>, {
        type: CampaignBudgetType;
        limit?: number | null | undefined;
        currency_code?: string | null | undefined;
    }, {
        type: CampaignBudgetType;
        limit?: number | null | undefined;
        currency_code?: string | null | undefined;
    }>, {
        type: CampaignBudgetType;
        limit?: number | null | undefined;
        currency_code?: string | null | undefined;
    }, {
        type: CampaignBudgetType;
        limit?: number | null | undefined;
        currency_code?: string | null | undefined;
    }>>>;
    starts_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    ends_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strict", z.ZodTypeAny, {
    name: string;
    campaign_identifier: string;
    description?: string | null | undefined;
    budget?: {
        type: CampaignBudgetType;
        limit?: number | null | undefined;
        currency_code?: string | null | undefined;
    } | null | undefined;
    starts_at?: Date | null | undefined;
    ends_at?: Date | null | undefined;
}, {
    name: string;
    campaign_identifier: string;
    description?: string | null | undefined;
    budget?: {
        type: CampaignBudgetType;
        limit?: number | null | undefined;
        currency_code?: string | null | undefined;
    } | null | undefined;
    starts_at?: Date | null | undefined;
    ends_at?: Date | null | undefined;
}>;
export declare const AdminCreateCampaign: (additionalDataValidator?: z.ZodOptional<z.ZodNullable<z.ZodObject<any, any>>>) => z.ZodObject<any, any, z.ZodTypeAny, {
    [x: string]: any;
}, {
    [x: string]: any;
}> | z.ZodEffects<any, any, any>;
export type AdminUpdateCampaignType = z.infer<typeof UpdateCampaign>;
export declare const UpdateCampaign: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    campaign_identifier: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    budget: z.ZodOptional<z.ZodObject<{
        limit: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, "strict", z.ZodTypeAny, {
        limit?: number | null | undefined;
    }, {
        limit?: number | null | undefined;
    }>>;
    starts_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    ends_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    campaign_identifier?: string | undefined;
    description?: string | null | undefined;
    budget?: {
        limit?: number | null | undefined;
    } | undefined;
    starts_at?: Date | null | undefined;
    ends_at?: Date | null | undefined;
}, {
    name?: string | undefined;
    campaign_identifier?: string | undefined;
    description?: string | null | undefined;
    budget?: {
        limit?: number | null | undefined;
    } | undefined;
    starts_at?: Date | null | undefined;
    ends_at?: Date | null | undefined;
}>;
export declare const AdminUpdateCampaign: (additionalDataValidator?: z.ZodOptional<z.ZodNullable<z.ZodObject<any, any>>>) => z.ZodObject<any, any, z.ZodTypeAny, {
    [x: string]: any;
}, {
    [x: string]: any;
}> | z.ZodEffects<any, any, any>;
//# sourceMappingURL=validators.d.ts.map