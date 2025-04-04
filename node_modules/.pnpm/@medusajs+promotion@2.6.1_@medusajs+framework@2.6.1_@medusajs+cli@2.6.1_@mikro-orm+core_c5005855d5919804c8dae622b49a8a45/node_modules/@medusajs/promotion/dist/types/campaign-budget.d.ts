import { BigNumberInput, CampaignBudgetTypeValues, InferEntityType } from "@medusajs/framework/types";
import { Campaign } from "../models";
export interface CreateCampaignBudgetDTO {
    type?: CampaignBudgetTypeValues;
    limit?: BigNumberInput | null;
    currency_code?: string | null;
    used?: BigNumberInput;
    campaign?: InferEntityType<typeof Campaign> | string;
}
export interface UpdateCampaignBudgetDTO {
    id: string;
    type?: CampaignBudgetTypeValues;
    limit?: BigNumberInput | null;
    currency_code?: string | null;
    used?: BigNumberInput;
}
//# sourceMappingURL=campaign-budget.d.ts.map