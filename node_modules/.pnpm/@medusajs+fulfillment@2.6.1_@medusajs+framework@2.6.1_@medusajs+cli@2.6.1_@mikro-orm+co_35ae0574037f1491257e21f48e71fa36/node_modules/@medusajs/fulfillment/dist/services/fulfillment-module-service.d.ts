import { CalculatedShippingOptionPrice, Context, DAL, FilterableFulfillmentSetProps, FindConfig, FulfillmentDTO, FulfillmentOption, FulfillmentTypes, IFulfillmentModuleService, InferEntityType, InternalModuleDeclaration, Logger, ModuleJoinerConfig, ModulesSdkTypes, ShippingOptionDTO, SoftDeleteReturn, UpdateFulfillmentSetDTO, ValidateFulfillmentDataContext } from "@medusajs/framework/types";
import { ModulesSdkUtils } from "@medusajs/framework/utils";
import { Fulfillment, FulfillmentSet, GeoZone, ServiceZone, ShippingOption, ShippingOptionRule, ShippingOptionType, ShippingProfile } from "../models";
import { UpdateShippingOptionsInput } from "../types/service";
import FulfillmentProviderService from "./fulfillment-provider";
type InjectedDependencies = {
    baseRepository: DAL.RepositoryService;
    fulfillmentAddressService: ModulesSdkTypes.IMedusaInternalService<any>;
    fulfillmentSetService: ModulesSdkTypes.IMedusaInternalService<any>;
    serviceZoneService: ModulesSdkTypes.IMedusaInternalService<any>;
    geoZoneService: ModulesSdkTypes.IMedusaInternalService<any>;
    shippingProfileService: ModulesSdkTypes.IMedusaInternalService<any>;
    shippingOptionService: ModulesSdkTypes.IMedusaInternalService<any>;
    shippingOptionRuleService: ModulesSdkTypes.IMedusaInternalService<any>;
    shippingOptionTypeService: ModulesSdkTypes.IMedusaInternalService<any>;
    fulfillmentProviderService: FulfillmentProviderService;
    fulfillmentService: ModulesSdkTypes.IMedusaInternalService<any>;
    logger?: Logger;
};
declare const FulfillmentModuleService_base: ModulesSdkUtils.MedusaServiceReturnType<{
    FulfillmentSet: {
        dto: FulfillmentTypes.FulfillmentSetDTO;
    };
    ServiceZone: {
        dto: FulfillmentTypes.ServiceZoneDTO;
    };
    ShippingOption: {
        dto: FulfillmentTypes.ShippingOptionDTO;
    };
    GeoZone: {
        dto: FulfillmentTypes.GeoZoneDTO;
    };
    ShippingProfile: {
        dto: FulfillmentTypes.ShippingProfileDTO;
    };
    ShippingOptionRule: {
        dto: FulfillmentTypes.ShippingOptionRuleDTO;
    };
    ShippingOptionType: {
        dto: FulfillmentTypes.ShippingOptionTypeDTO;
    };
    FulfillmentProvider: {
        dto: FulfillmentTypes.FulfillmentProviderDTO;
    };
}>;
export default class FulfillmentModuleService extends FulfillmentModuleService_base implements IFulfillmentModuleService {
    protected readonly moduleDeclaration: InternalModuleDeclaration;
    protected baseRepository_: DAL.RepositoryService;
    protected readonly fulfillmentSetService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof FulfillmentSet>>;
    protected readonly serviceZoneService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof ServiceZone>>;
    protected readonly geoZoneService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof GeoZone>>;
    protected readonly shippingProfileService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof ShippingProfile>>;
    protected readonly shippingOptionService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof ShippingOption>>;
    protected readonly shippingOptionRuleService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof ShippingOptionRule>>;
    protected readonly shippingOptionTypeService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof ShippingOptionType>>;
    protected readonly fulfillmentProviderService_: FulfillmentProviderService;
    protected readonly fulfillmentService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof Fulfillment>>;
    constructor({ baseRepository, fulfillmentSetService, serviceZoneService, geoZoneService, shippingProfileService, shippingOptionService, shippingOptionRuleService, shippingOptionTypeService, fulfillmentProviderService, fulfillmentService, fulfillmentAddressService, }: InjectedDependencies, moduleDeclaration: InternalModuleDeclaration);
    __joinerConfig(): ModuleJoinerConfig;
    listShippingOptions(filters?: FulfillmentTypes.FilterableShippingOptionForContextProps, config?: FindConfig<FulfillmentTypes.ShippingOptionDTO>, sharedContext?: Context): Promise<FulfillmentTypes.ShippingOptionDTO[]>;
    listShippingOptionsForContext(filters: FulfillmentTypes.FilterableShippingOptionForContextProps, config?: FindConfig<ShippingOptionDTO>, sharedContext?: Context): Promise<FulfillmentTypes.ShippingOptionDTO[]>;
    retrieveFulfillment(id: string, config?: FindConfig<FulfillmentTypes.FulfillmentDTO>, sharedContext?: Context): Promise<FulfillmentTypes.FulfillmentDTO>;
    listFulfillments(filters?: FulfillmentTypes.FilterableFulfillmentProps, config?: FindConfig<FulfillmentTypes.FulfillmentDTO>, sharedContext?: Context): Promise<FulfillmentTypes.FulfillmentDTO[]>;
    listAndCountFulfillments(filters?: FilterableFulfillmentSetProps, config?: FindConfig<FulfillmentDTO>, sharedContext?: Context): Promise<[FulfillmentDTO[], number]>;
    createFulfillmentSets(data: FulfillmentTypes.CreateFulfillmentSetDTO[], sharedContext?: Context): Promise<FulfillmentTypes.FulfillmentSetDTO[]>;
    createFulfillmentSets(data: FulfillmentTypes.CreateFulfillmentSetDTO, sharedContext?: Context): Promise<FulfillmentTypes.FulfillmentSetDTO>;
    protected createFulfillmentSets_(data: FulfillmentTypes.CreateFulfillmentSetDTO | FulfillmentTypes.CreateFulfillmentSetDTO[], sharedContext?: Context): Promise<InferEntityType<typeof FulfillmentSet>[]>;
    createServiceZones(data: FulfillmentTypes.CreateServiceZoneDTO[], sharedContext?: Context): Promise<FulfillmentTypes.ServiceZoneDTO[]>;
    createServiceZones(data: FulfillmentTypes.CreateServiceZoneDTO, sharedContext?: Context): Promise<FulfillmentTypes.ServiceZoneDTO>;
    protected createServiceZones_(data: FulfillmentTypes.CreateServiceZoneDTO[] | FulfillmentTypes.CreateServiceZoneDTO, sharedContext?: Context): Promise<InferEntityType<typeof ServiceZone>[]>;
    createShippingOptions(data: FulfillmentTypes.CreateShippingOptionDTO[], sharedContext?: Context): Promise<FulfillmentTypes.ShippingOptionDTO[]>;
    createShippingOptions(data: FulfillmentTypes.CreateShippingOptionDTO, sharedContext?: Context): Promise<FulfillmentTypes.ShippingOptionDTO>;
    createShippingOptions_(data: FulfillmentTypes.CreateShippingOptionDTO[] | FulfillmentTypes.CreateShippingOptionDTO, sharedContext?: Context): Promise<InferEntityType<typeof ShippingOption>[]>;
    createShippingProfiles(data: FulfillmentTypes.CreateShippingProfileDTO[], sharedContext?: Context): Promise<FulfillmentTypes.ShippingProfileDTO[]>;
    createShippingProfiles(data: FulfillmentTypes.CreateShippingProfileDTO, sharedContext?: Context): Promise<FulfillmentTypes.ShippingProfileDTO>;
    createShippingProfiles_(data: FulfillmentTypes.CreateShippingProfileDTO[] | FulfillmentTypes.CreateShippingProfileDTO, sharedContext?: Context): Promise<InferEntityType<typeof ShippingProfile>[]>;
    createGeoZones(data: FulfillmentTypes.CreateGeoZoneDTO[], sharedContext?: Context): Promise<FulfillmentTypes.GeoZoneDTO[]>;
    createGeoZones(data: FulfillmentTypes.CreateGeoZoneDTO, sharedContext?: Context): Promise<FulfillmentTypes.GeoZoneDTO>;
    createShippingOptionRules(data: FulfillmentTypes.CreateShippingOptionRuleDTO[], sharedContext?: Context): Promise<FulfillmentTypes.ShippingOptionRuleDTO[]>;
    createShippingOptionRules(data: FulfillmentTypes.CreateShippingOptionRuleDTO, sharedContext?: Context): Promise<FulfillmentTypes.ShippingOptionRuleDTO>;
    createShippingOptionRules_(data: FulfillmentTypes.CreateShippingOptionRuleDTO[] | FulfillmentTypes.CreateShippingOptionRuleDTO, sharedContext?: Context): Promise<InferEntityType<typeof ShippingOptionRule>[]>;
    createFulfillment(data: FulfillmentTypes.CreateFulfillmentDTO, sharedContext?: Context): Promise<FulfillmentTypes.FulfillmentDTO>;
    deleteFulfillment(id: string, sharedContext?: Context): Promise<void>;
    createReturnFulfillment(data: FulfillmentTypes.CreateFulfillmentDTO, sharedContext?: Context): Promise<FulfillmentTypes.FulfillmentDTO>;
    updateFulfillmentSets(data: FulfillmentTypes.UpdateFulfillmentSetDTO[], sharedContext?: Context): Promise<FulfillmentTypes.FulfillmentSetDTO[]>;
    updateFulfillmentSets(data: FulfillmentTypes.UpdateFulfillmentSetDTO, sharedContext?: Context): Promise<FulfillmentTypes.FulfillmentSetDTO>;
    protected updateFulfillmentSets_(data: UpdateFulfillmentSetDTO[] | UpdateFulfillmentSetDTO, sharedContext?: Context): Promise<InferEntityType<typeof FulfillmentSet>[] | InferEntityType<typeof FulfillmentSet>>;
    updateServiceZones(id: string, data: FulfillmentTypes.UpdateServiceZoneDTO, sharedContext?: Context): Promise<FulfillmentTypes.ServiceZoneDTO>;
    updateServiceZones(selector: FulfillmentTypes.FilterableServiceZoneProps, data: FulfillmentTypes.UpdateServiceZoneDTO, sharedContext?: Context): Promise<FulfillmentTypes.ServiceZoneDTO[]>;
    protected updateServiceZones_(data: FulfillmentTypes.UpdateServiceZoneDTO[] | FulfillmentTypes.UpdateServiceZoneDTO, sharedContext?: Context): Promise<InferEntityType<typeof ServiceZone> | InferEntityType<typeof ServiceZone>[]>;
    upsertServiceZones(data: FulfillmentTypes.UpsertServiceZoneDTO, sharedContext?: Context): Promise<FulfillmentTypes.ServiceZoneDTO>;
    upsertServiceZones(data: FulfillmentTypes.UpsertServiceZoneDTO[], sharedContext?: Context): Promise<FulfillmentTypes.ServiceZoneDTO[]>;
    upsertServiceZones_(data: FulfillmentTypes.UpsertServiceZoneDTO[] | FulfillmentTypes.UpsertServiceZoneDTO, sharedContext?: Context): Promise<InferEntityType<typeof ServiceZone>[] | InferEntityType<typeof ServiceZone>>;
    updateShippingOptions(id: string, data: FulfillmentTypes.UpdateShippingOptionDTO, sharedContext?: Context): Promise<FulfillmentTypes.ShippingOptionDTO>;
    updateShippingOptions(selector: FulfillmentTypes.FilterableShippingOptionProps, data: FulfillmentTypes.UpdateShippingOptionDTO, sharedContext?: Context): Promise<FulfillmentTypes.ShippingOptionDTO[]>;
    updateShippingOptions_(data: UpdateShippingOptionsInput[] | UpdateShippingOptionsInput, sharedContext?: Context): Promise<InferEntityType<typeof ShippingOption> | InferEntityType<typeof ShippingOption>[]>;
    private handleShippingOptionUpdateEvents;
    upsertShippingOptions(data: FulfillmentTypes.UpsertShippingOptionDTO[], sharedContext?: Context): Promise<FulfillmentTypes.ShippingOptionDTO[]>;
    upsertShippingOptions(data: FulfillmentTypes.UpsertShippingOptionDTO, sharedContext?: Context): Promise<FulfillmentTypes.ShippingOptionDTO>;
    upsertShippingOptions_(data: FulfillmentTypes.UpsertShippingOptionDTO[] | FulfillmentTypes.UpsertShippingOptionDTO, sharedContext?: Context): Promise<InferEntityType<typeof ShippingOption>[]>;
    updateShippingProfiles(selector: FulfillmentTypes.FilterableShippingProfileProps, data: FulfillmentTypes.UpdateShippingProfileDTO, sharedContext?: Context): Promise<FulfillmentTypes.ShippingProfileDTO[]>;
    updateShippingProfiles(id: string, data: FulfillmentTypes.UpdateShippingProfileDTO, sharedContext?: Context): Promise<FulfillmentTypes.ShippingProfileDTO>;
    upsertShippingProfiles(data: FulfillmentTypes.UpsertShippingProfileDTO[], sharedContext?: Context): Promise<FulfillmentTypes.ShippingProfileDTO[]>;
    upsertShippingProfiles(data: FulfillmentTypes.UpsertShippingProfileDTO, sharedContext?: Context): Promise<FulfillmentTypes.ShippingProfileDTO>;
    updateGeoZones(data: FulfillmentTypes.UpdateGeoZoneDTO[], sharedContext?: Context): Promise<FulfillmentTypes.GeoZoneDTO[]>;
    updateGeoZones(data: FulfillmentTypes.UpdateGeoZoneDTO, sharedContext?: Context): Promise<FulfillmentTypes.GeoZoneDTO>;
    updateShippingOptionRules(data: FulfillmentTypes.UpdateShippingOptionRuleDTO[], sharedContext?: Context): Promise<FulfillmentTypes.ShippingOptionRuleDTO[]>;
    updateShippingOptionRules(data: FulfillmentTypes.UpdateShippingOptionRuleDTO, sharedContext?: Context): Promise<FulfillmentTypes.ShippingOptionRuleDTO>;
    updateShippingOptionRules_(data: FulfillmentTypes.UpdateShippingOptionRuleDTO[] | FulfillmentTypes.UpdateShippingOptionRuleDTO, sharedContext?: Context): Promise<InferEntityType<typeof ShippingOptionRule> | InferEntityType<typeof ShippingOptionRule>[]>;
    updateFulfillment(id: string, data: FulfillmentTypes.UpdateFulfillmentDTO, sharedContext?: Context): Promise<FulfillmentTypes.FulfillmentDTO>;
    protected updateFulfillment_(id: string, data: FulfillmentTypes.UpdateFulfillmentDTO, sharedContext: Context): Promise<InferEntityType<typeof Fulfillment>>;
    private handleFulfillmentUpdateEvents;
    cancelFulfillment(id: string, sharedContext?: Context): Promise<FulfillmentDTO>;
    retrieveFulfillmentOptions(providerId: string): Promise<FulfillmentOption[]>;
    validateFulfillmentData(providerId: string, optionData: Record<string, unknown>, data: Record<string, unknown>, context: ValidateFulfillmentDataContext): Promise<Record<string, unknown>>;
    validateFulfillmentOption(providerId: string, data: Record<string, unknown>): Promise<boolean>;
    validateShippingOption(shippingOptionId: string, context?: Record<string, unknown>, sharedContext?: Context): Promise<boolean>;
    validateShippingOptionsForPriceCalculation(shippingOptionsData: FulfillmentTypes.CreateShippingOptionDTO[], sharedContext?: Context): Promise<boolean[]>;
    calculateShippingOptionsPrices(shippingOptionsData: FulfillmentTypes.CalculateShippingOptionPriceDTO[]): Promise<CalculatedShippingOptionPrice[]>;
    deleteShippingProfiles(ids: string | string[], sharedContext?: Context): Promise<void>;
    softDeleteShippingProfiles<TReturnableLinkableKeys extends string = string>(ids: string[], config?: SoftDeleteReturn<TReturnableLinkableKeys>, sharedContext?: Context): Promise<Record<string, string[]> | void>;
    protected validateShippingProfileDeletion(ids: string[], sharedContext: Context): Promise<void>;
    protected static canCancelFulfillmentOrThrow(fulfillment: InferEntityType<typeof Fulfillment>): boolean;
    protected static validateMissingShippingOptions_(shippingOptions: InferEntityType<typeof ShippingOption>[], shippingOptionsData: UpdateShippingOptionsInput[]): void;
    protected static validateMissingShippingOptionRules(shippingOption: InferEntityType<typeof ShippingOption>, shippingOptionUpdateData: FulfillmentTypes.UpdateShippingOptionDTO): void;
    protected static validateGeoZones(geoZones: ((Partial<FulfillmentTypes.CreateGeoZoneDTO> & {
        type: string;
    }) | (Partial<FulfillmentTypes.UpdateGeoZoneDTO> & {
        type: string;
    }))[]): void;
    protected static normalizeListShippingOptionsForContextParams(filters: FulfillmentTypes.FilterableShippingOptionForContextProps, config?: FindConfig<ShippingOptionDTO>): {
        filters: {
            id?: string | string[] | DAL.OperatorMap<string | string[]>;
            name?: string | string[] | DAL.OperatorMap<string | string[]>;
            shipping_profile_id?: string | string[] | DAL.OperatorMap<string | string[]>;
            price_type?: FulfillmentTypes.ShippingOptionPriceType | FulfillmentTypes.ShippingOptionPriceType[] | DAL.OperatorMap<FulfillmentTypes.ShippingOptionPriceType | FulfillmentTypes.ShippingOptionPriceType[]>;
            service_zone?: FulfillmentTypes.FilterableServiceZoneProps;
            shipping_option_type?: FulfillmentTypes.FilterableShippingOptionTypeProps;
            rules?: FulfillmentTypes.FilterableShippingOptionRuleProps;
            $and?: (FulfillmentTypes.FilterableShippingOptionProps | DAL.BaseFilterable<FulfillmentTypes.FilterableShippingOptionProps>)[] | undefined;
            $or?: (FulfillmentTypes.FilterableShippingOptionProps | DAL.BaseFilterable<FulfillmentTypes.FilterableShippingOptionProps>)[] | undefined;
        };
        config: {
            select?: ((string & {}) | keyof FulfillmentTypes.ShippingOptionDTO)[] | undefined;
            skip?: number | null | undefined;
            take?: number | null | undefined;
            relations?: string[];
            order?: import("@medusajs/framework/types").FindConfigOrder;
            withDeleted?: boolean;
            filters?: Record<string, any>;
            options?: Record<string, any>;
        };
        context: Record<string, any> | undefined;
    };
    /**
     * Build the constraints for the geo zones based on the address properties
     * available and the hierarchy of required properties.
     * We build a OR constraint from the narrowest to the broadest
     * e.g. if we have a postal expression we build a constraint for the postal expression require props of type zip
     * and a constraint for the city required props of type city
     * and a constraint for the province code required props of type province
     * and a constraint for the country code required props of type country
     * example:
     * {
     *    $or: [
     *      {
     *        type: "zip",
     *        country_code: "SE",
     *        province_code: "AB",
     *        city: "Stockholm",
     *        postal_expression: "12345"
     *      },
     *      {
     *        type: "city",
     *        country_code: "SE",
     *        province_code: "AB",
     *        city: "Stockholm"
     *      },
     *      {
     *        type: "province",
     *        country_code: "SE",
     *        province_code: "AB"
     *      },
     *      {
     *        type: "country",
     *        country_code: "SE"
     *      }
     *    ]
     *  }
     */
    protected static buildGeoZoneConstraintsFromAddress(address: FulfillmentTypes.FilterableShippingOptionForContextProps["address"]): Record<string, any>[];
}
export {};
//# sourceMappingURL=fulfillment-module-service.d.ts.map