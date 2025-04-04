import { InferEntityType, PromotionDTO } from "@medusajs/framework/types";
import { Promotion } from "../models";
export interface CreateCampaignDTO {
    name: string;
    description?: string | null;
    campaign_identifier: string;
    starts_at?: Date | null;
    ends_at?: Date | null;
    promotions?: (PromotionDTO | InferEntityType<typeof Promotion>)[];
}
export interface UpdateCampaignDTO {
    id: string;
    name?: string;
    description?: string | null;
    campaign_identifier?: string;
    starts_at?: Date | null;
    ends_at?: Date | null;
    promotions?: (PromotionDTO | InferEntityType<typeof Promotion>)[];
}
//# sourceMappingURL=campaign.d.ts.map