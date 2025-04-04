import { CalculateShippingOptionPriceDTO, Constructor, CreateFulfillmentResult, CreateShippingOptionDTO, DAL, FulfillmentDTO, FulfillmentItemDTO, FulfillmentOption, FulfillmentOrderDTO, FulfillmentTypes, IFulfillmentProvider, Logger, ValidateFulfillmentDataContext } from "@medusajs/framework/types";
type InjectedDependencies = {
    logger?: Logger;
    fulfillmentProviderRepository: DAL.RepositoryService;
    [key: `fp_${string}`]: FulfillmentTypes.IFulfillmentProvider;
};
declare const FulfillmentProviderService_base: new (container: InjectedDependencies) => import("@medusajs/framework/types").IMedusaInternalService<any, InjectedDependencies>;
export default class FulfillmentProviderService extends FulfillmentProviderService_base {
    #private;
    protected readonly fulfillmentProviderRepository_: DAL.RepositoryService;
    constructor(container: InjectedDependencies);
    static getRegistrationIdentifier(providerClass: Constructor<IFulfillmentProvider>, optionName?: string): string;
    protected retrieveProviderRegistration(providerId: string): FulfillmentTypes.IFulfillmentProvider;
    listFulfillmentOptions(providerIds: string[]): Promise<any[]>;
    getFulfillmentOptions(providerId: string): Promise<FulfillmentOption[]>;
    validateFulfillmentData(providerId: string, optionData: Record<string, unknown>, data: Record<string, unknown>, context: ValidateFulfillmentDataContext): Promise<any>;
    validateOption(providerId: string, data: Record<string, unknown>): Promise<boolean>;
    canCalculate(providerId: string, data: CreateShippingOptionDTO): Promise<boolean>;
    calculatePrice(providerId: string, optionData: CalculateShippingOptionPriceDTO["optionData"], data: CalculateShippingOptionPriceDTO["data"], context: CalculateShippingOptionPriceDTO["context"]): Promise<FulfillmentTypes.CalculatedShippingOptionPrice>;
    createFulfillment(providerId: string, data: Record<string, unknown>, items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[], order: Partial<FulfillmentOrderDTO> | undefined, fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>): Promise<CreateFulfillmentResult>;
    cancelFulfillment(providerId: string, fulfillment: Record<string, unknown>): Promise<any>;
    createReturn(providerId: string, fulfillment: Record<string, unknown>): Promise<CreateFulfillmentResult>;
}
export {};
//# sourceMappingURL=fulfillment-provider.d.ts.map