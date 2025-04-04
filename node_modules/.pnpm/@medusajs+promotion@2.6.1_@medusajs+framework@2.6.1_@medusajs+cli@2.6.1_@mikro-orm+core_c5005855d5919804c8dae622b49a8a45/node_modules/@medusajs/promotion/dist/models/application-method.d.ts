import { PromotionUtils } from "@medusajs/framework/utils";
import PromotionRule from "./promotion-rule";
declare const ApplicationMethod: import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
    value: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").BigNumberProperty>;
    currency_code: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
    max_quantity: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").NumberProperty>;
    apply_to_quantity: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").NumberProperty>;
    buy_rules_min_quantity: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").NumberProperty>;
    type: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.ApplicationMethodType>;
    target_type: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.ApplicationMethodTargetType>;
    allocation: import("@medusajs/framework/utils").NullableModifier<PromotionUtils.ApplicationMethodAllocation, import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.ApplicationMethodAllocation>>;
    promotion: import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
        id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
        code: import("@medusajs/framework/utils").TextProperty;
        is_automatic: import("@medusajs/framework/utils").BooleanProperty;
        type: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.PromotionType>;
        status: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.PromotionStatus>;
        campaign: import("@medusajs/framework/utils").RelationNullableModifier<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
            id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
            name: import("@medusajs/framework/utils").TextProperty;
            description: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
            campaign_identifier: import("@medusajs/framework/utils").TextProperty;
            starts_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
            ends_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
            budget: import("@medusajs/framework/utils").RelationNullableModifier<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
                id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
                type: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.CampaignBudgetType>;
                currency_code: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
                limit: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").BigNumberProperty>;
                used: import("@medusajs/framework/utils").BigNumberProperty;
                campaign: import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, {
                    readonly name: "Campaign";
                    readonly tableName: "promotion_campaign";
                }>, undefined>;
            }>, {
                readonly name: "CampaignBudget";
                readonly tableName: "promotion_campaign_budget";
            }>, import("@medusajs/framework/utils").HasOne<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
                id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
                type: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.CampaignBudgetType>;
                currency_code: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
                limit: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").BigNumberProperty>;
                used: import("@medusajs/framework/utils").BigNumberProperty;
                campaign: import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, {
                    readonly name: "Campaign";
                    readonly tableName: "promotion_campaign";
                }>, undefined>;
            }>, {
                readonly name: "CampaignBudget";
                readonly tableName: "promotion_campaign_budget";
            }>>, false>;
            promotions: import("@medusajs/framework/utils").HasMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, "Promotion">>;
        }>, {
            readonly name: "Campaign";
            readonly tableName: "promotion_campaign";
        }>, import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
            id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
            name: import("@medusajs/framework/utils").TextProperty;
            description: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
            campaign_identifier: import("@medusajs/framework/utils").TextProperty;
            starts_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
            ends_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
            budget: import("@medusajs/framework/utils").RelationNullableModifier<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
                id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
                type: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.CampaignBudgetType>;
                currency_code: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
                limit: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").BigNumberProperty>;
                used: import("@medusajs/framework/utils").BigNumberProperty;
                campaign: import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, {
                    readonly name: "Campaign";
                    readonly tableName: "promotion_campaign";
                }>, undefined>;
            }>, {
                readonly name: "CampaignBudget";
                readonly tableName: "promotion_campaign_budget";
            }>, import("@medusajs/framework/utils").HasOne<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
                id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
                type: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.CampaignBudgetType>;
                currency_code: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
                limit: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").BigNumberProperty>;
                used: import("@medusajs/framework/utils").BigNumberProperty;
                campaign: import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, {
                    readonly name: "Campaign";
                    readonly tableName: "promotion_campaign";
                }>, undefined>;
            }>, {
                readonly name: "CampaignBudget";
                readonly tableName: "promotion_campaign_budget";
            }>>, false>;
            promotions: import("@medusajs/framework/utils").HasMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, "Promotion">>;
        }>, {
            readonly name: "Campaign";
            readonly tableName: "promotion_campaign";
        }>, undefined>, true>;
        application_method: import("@medusajs/framework/utils").RelationNullableModifier<() => typeof ApplicationMethod, import("@medusajs/framework/utils").HasOne<() => typeof ApplicationMethod>, false>;
        rules: import("@medusajs/framework/utils").ManyToMany<() => typeof PromotionRule>;
    }>, "Promotion">, undefined>;
    target_rules: import("@medusajs/framework/utils").ManyToMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
        id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
        description: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
        attribute: import("@medusajs/framework/utils").TextProperty;
        operator: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.PromotionRuleOperator>;
        values: import("@medusajs/framework/utils").HasMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
            id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
            value: import("@medusajs/framework/utils").TextProperty;
            promotion_rule: import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, {
                readonly name: "PromotionRule";
                readonly tableName: "promotion_rule";
            }>, undefined>;
        }>, {
            readonly name: "PromotionRuleValue";
            readonly tableName: "promotion_rule_value";
        }>>;
        promotions: import("@medusajs/framework/utils").ManyToMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
            id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
            code: import("@medusajs/framework/utils").TextProperty;
            is_automatic: import("@medusajs/framework/utils").BooleanProperty;
            type: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.PromotionType>;
            status: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.PromotionStatus>;
            campaign: import("@medusajs/framework/utils").RelationNullableModifier<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
                id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
                name: import("@medusajs/framework/utils").TextProperty;
                description: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
                campaign_identifier: import("@medusajs/framework/utils").TextProperty;
                starts_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
                ends_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
                budget: import("@medusajs/framework/utils").RelationNullableModifier<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
                    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
                    type: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.CampaignBudgetType>;
                    currency_code: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
                    limit: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").BigNumberProperty>;
                    used: import("@medusajs/framework/utils").BigNumberProperty;
                    campaign: import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, {
                        readonly name: "Campaign";
                        readonly tableName: "promotion_campaign";
                    }>, undefined>;
                }>, {
                    readonly name: "CampaignBudget";
                    readonly tableName: "promotion_campaign_budget";
                }>, import("@medusajs/framework/utils").HasOne<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
                    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
                    type: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.CampaignBudgetType>;
                    currency_code: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
                    limit: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").BigNumberProperty>;
                    used: import("@medusajs/framework/utils").BigNumberProperty;
                    campaign: import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, {
                        readonly name: "Campaign";
                        readonly tableName: "promotion_campaign";
                    }>, undefined>;
                }>, {
                    readonly name: "CampaignBudget";
                    readonly tableName: "promotion_campaign_budget";
                }>>, false>;
                promotions: import("@medusajs/framework/utils").HasMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, "Promotion">>;
            }>, {
                readonly name: "Campaign";
                readonly tableName: "promotion_campaign";
            }>, import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
                id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
                name: import("@medusajs/framework/utils").TextProperty;
                description: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
                campaign_identifier: import("@medusajs/framework/utils").TextProperty;
                starts_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
                ends_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
                budget: import("@medusajs/framework/utils").RelationNullableModifier<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
                    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
                    type: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.CampaignBudgetType>;
                    currency_code: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
                    limit: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").BigNumberProperty>;
                    used: import("@medusajs/framework/utils").BigNumberProperty;
                    campaign: import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, {
                        readonly name: "Campaign";
                        readonly tableName: "promotion_campaign";
                    }>, undefined>;
                }>, {
                    readonly name: "CampaignBudget";
                    readonly tableName: "promotion_campaign_budget";
                }>, import("@medusajs/framework/utils").HasOne<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
                    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
                    type: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.CampaignBudgetType>;
                    currency_code: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
                    limit: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").BigNumberProperty>;
                    used: import("@medusajs/framework/utils").BigNumberProperty;
                    campaign: import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, {
                        readonly name: "Campaign";
                        readonly tableName: "promotion_campaign";
                    }>, undefined>;
                }>, {
                    readonly name: "CampaignBudget";
                    readonly tableName: "promotion_campaign_budget";
                }>>, false>;
                promotions: import("@medusajs/framework/utils").HasMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, "Promotion">>;
            }>, {
                readonly name: "Campaign";
                readonly tableName: "promotion_campaign";
            }>, undefined>, true>;
            application_method: import("@medusajs/framework/utils").RelationNullableModifier<() => typeof ApplicationMethod, import("@medusajs/framework/utils").HasOne<() => typeof ApplicationMethod>, false>;
            rules: import("@medusajs/framework/utils").ManyToMany<() => typeof PromotionRule>;
        }>, "Promotion">>;
        method_target_rules: import("@medusajs/framework/utils").ManyToMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, {
            readonly name: "ApplicationMethod";
            readonly tableName: "promotion_application_method";
        }>>;
        method_buy_rules: import("@medusajs/framework/utils").ManyToMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, {
            readonly name: "ApplicationMethod";
            readonly tableName: "promotion_application_method";
        }>>;
    }>, {
        readonly name: "PromotionRule";
        readonly tableName: "promotion_rule";
    }>>;
    buy_rules: import("@medusajs/framework/utils").ManyToMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
        id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
        description: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
        attribute: import("@medusajs/framework/utils").TextProperty;
        operator: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.PromotionRuleOperator>;
        values: import("@medusajs/framework/utils").HasMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
            id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
            value: import("@medusajs/framework/utils").TextProperty;
            promotion_rule: import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, {
                readonly name: "PromotionRule";
                readonly tableName: "promotion_rule";
            }>, undefined>;
        }>, {
            readonly name: "PromotionRuleValue";
            readonly tableName: "promotion_rule_value";
        }>>;
        promotions: import("@medusajs/framework/utils").ManyToMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
            id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
            code: import("@medusajs/framework/utils").TextProperty;
            is_automatic: import("@medusajs/framework/utils").BooleanProperty;
            type: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.PromotionType>;
            status: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.PromotionStatus>;
            campaign: import("@medusajs/framework/utils").RelationNullableModifier<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
                id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
                name: import("@medusajs/framework/utils").TextProperty;
                description: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
                campaign_identifier: import("@medusajs/framework/utils").TextProperty;
                starts_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
                ends_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
                budget: import("@medusajs/framework/utils").RelationNullableModifier<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
                    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
                    type: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.CampaignBudgetType>;
                    currency_code: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
                    limit: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").BigNumberProperty>;
                    used: import("@medusajs/framework/utils").BigNumberProperty;
                    campaign: import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, {
                        readonly name: "Campaign";
                        readonly tableName: "promotion_campaign";
                    }>, undefined>;
                }>, {
                    readonly name: "CampaignBudget";
                    readonly tableName: "promotion_campaign_budget";
                }>, import("@medusajs/framework/utils").HasOne<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
                    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
                    type: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.CampaignBudgetType>;
                    currency_code: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
                    limit: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").BigNumberProperty>;
                    used: import("@medusajs/framework/utils").BigNumberProperty;
                    campaign: import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, {
                        readonly name: "Campaign";
                        readonly tableName: "promotion_campaign";
                    }>, undefined>;
                }>, {
                    readonly name: "CampaignBudget";
                    readonly tableName: "promotion_campaign_budget";
                }>>, false>;
                promotions: import("@medusajs/framework/utils").HasMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, "Promotion">>;
            }>, {
                readonly name: "Campaign";
                readonly tableName: "promotion_campaign";
            }>, import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
                id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
                name: import("@medusajs/framework/utils").TextProperty;
                description: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
                campaign_identifier: import("@medusajs/framework/utils").TextProperty;
                starts_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
                ends_at: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
                budget: import("@medusajs/framework/utils").RelationNullableModifier<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
                    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
                    type: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.CampaignBudgetType>;
                    currency_code: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
                    limit: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").BigNumberProperty>;
                    used: import("@medusajs/framework/utils").BigNumberProperty;
                    campaign: import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, {
                        readonly name: "Campaign";
                        readonly tableName: "promotion_campaign";
                    }>, undefined>;
                }>, {
                    readonly name: "CampaignBudget";
                    readonly tableName: "promotion_campaign_budget";
                }>, import("@medusajs/framework/utils").HasOne<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
                    id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
                    type: import("@medusajs/framework/utils").EnumProperty<typeof PromotionUtils.CampaignBudgetType>;
                    currency_code: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
                    limit: import("@medusajs/framework/utils").NullableModifier<number, import("@medusajs/framework/utils").BigNumberProperty>;
                    used: import("@medusajs/framework/utils").BigNumberProperty;
                    campaign: import("@medusajs/framework/utils").BelongsTo<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, {
                        readonly name: "Campaign";
                        readonly tableName: "promotion_campaign";
                    }>, undefined>;
                }>, {
                    readonly name: "CampaignBudget";
                    readonly tableName: "promotion_campaign_budget";
                }>>, false>;
                promotions: import("@medusajs/framework/utils").HasMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, "Promotion">>;
            }>, {
                readonly name: "Campaign";
                readonly tableName: "promotion_campaign";
            }>, undefined>, true>;
            application_method: import("@medusajs/framework/utils").RelationNullableModifier<() => typeof ApplicationMethod, import("@medusajs/framework/utils").HasOne<() => typeof ApplicationMethod>, false>;
            rules: import("@medusajs/framework/utils").ManyToMany<() => typeof PromotionRule>;
        }>, "Promotion">>;
        method_target_rules: import("@medusajs/framework/utils").ManyToMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, {
            readonly name: "ApplicationMethod";
            readonly tableName: "promotion_application_method";
        }>>;
        method_buy_rules: import("@medusajs/framework/utils").ManyToMany<() => import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<any>, {
            readonly name: "ApplicationMethod";
            readonly tableName: "promotion_application_method";
        }>>;
    }>, {
        readonly name: "PromotionRule";
        readonly tableName: "promotion_rule";
    }>>;
}>, {
    readonly name: "ApplicationMethod";
    readonly tableName: "promotion_application_method";
}>;
export default ApplicationMethod;
//# sourceMappingURL=application-method.d.ts.map