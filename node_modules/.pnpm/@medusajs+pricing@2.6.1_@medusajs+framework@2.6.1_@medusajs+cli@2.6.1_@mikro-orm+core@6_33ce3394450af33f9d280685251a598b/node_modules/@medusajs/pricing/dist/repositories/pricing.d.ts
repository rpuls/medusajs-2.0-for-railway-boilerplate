import { MikroOrmBase } from "@medusajs/framework/utils";
import { CalculatedPriceSetDTO, Context, PricingContext, PricingFilters, PricingRepositoryService } from "@medusajs/framework/types";
export declare class PricingRepository extends MikroOrmBase implements PricingRepositoryService {
    constructor();
    calculatePrices(pricingFilters: PricingFilters, pricingContext?: PricingContext, sharedContext?: Context): Promise<CalculatedPriceSetDTO[]>;
}
//# sourceMappingURL=pricing.d.ts.map