import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils";
import { CalculatedShippingOptionPrice, CalculateShippingOptionPriceContext, CreateFulfillmentResult, FulfillmentOption, ValidateFulfillmentDataContext } from "@medusajs/types";
export declare class ManualFulfillmentService extends AbstractFulfillmentProviderService {
    static identifier: string;
    constructor();
    getFulfillmentOptions(): Promise<FulfillmentOption[]>;
    validateFulfillmentData(optionData: Record<string, unknown>, data: Record<string, unknown>, context: ValidateFulfillmentDataContext): Promise<any>;
    calculatePrice(optionData: Record<string, unknown>, data: Record<string, unknown>, context: CalculateShippingOptionPriceContext): Promise<CalculatedShippingOptionPrice>;
    canCalculate(): Promise<boolean>;
    validateOption(data: Record<string, any>): Promise<boolean>;
    createFulfillment(): Promise<CreateFulfillmentResult>;
    cancelFulfillment(): Promise<any>;
    createReturnFulfillment(): Promise<CreateFulfillmentResult>;
}
//# sourceMappingURL=manual-fulfillment.d.ts.map