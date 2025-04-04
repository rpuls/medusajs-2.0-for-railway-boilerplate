import { HttpTypes } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class Promotion {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    retrieve(id: string, query?: HttpTypes.AdminGetPromotionParams, headers?: ClientHeaders): Promise<HttpTypes.AdminPromotionResponse>;
    list(query?: HttpTypes.AdminGetPromotionsParams, headers?: ClientHeaders): Promise<HttpTypes.AdminPromotionListResponse>;
    create(payload: HttpTypes.AdminCreatePromotion, headers?: ClientHeaders): Promise<HttpTypes.AdminPromotionResponse>;
    update(id: string, payload: HttpTypes.AdminUpdatePromotion, headers?: ClientHeaders): Promise<HttpTypes.AdminPromotionResponse>;
    delete(id: string, headers?: ClientHeaders): Promise<HttpTypes.DeleteResponse<"promotion">>;
    addRules(id: string, ruleType: string, payload: HttpTypes.BatchAddPromotionRulesReq, headers?: ClientHeaders): Promise<HttpTypes.AdminPromotionResponse>;
    updateRules(id: string, ruleType: string, payload: HttpTypes.BatchUpdatePromotionRulesReq, headers?: ClientHeaders): Promise<HttpTypes.AdminPromotionResponse>;
    removeRules(id: string, ruleType: string, payload: HttpTypes.BatchRemovePromotionRulesReq, headers?: ClientHeaders): Promise<HttpTypes.AdminPromotionResponse>;
    listRules(id: string | null, ruleType: string, query?: HttpTypes.AdminGetPromotionRuleParams, headers?: ClientHeaders): Promise<HttpTypes.AdminRuleAttributeOptionsListResponse>;
    listRuleAttributes(ruleType: string, promotionType?: string, headers?: ClientHeaders): Promise<HttpTypes.AdminRuleAttributeOptionsListResponse>;
    listRuleValues(ruleType: string, ruleValue: string, query?: HttpTypes.AdminGetPromotionsRuleValueParams, headers?: ClientHeaders): Promise<HttpTypes.AdminRuleValueOptionsListResponse>;
}
//# sourceMappingURL=promotion.d.ts.map