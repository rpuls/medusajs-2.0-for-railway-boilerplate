import { PromotionUtils } from "@medusajs/framework/utils";
import ApplicationMethod from "./application-method";
import PromotionRule from "./promotion-rule";
declare const Promotion: import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
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
}>, "Promotion">;
export default Promotion;
//# sourceMappingURL=promotion.d.ts.map