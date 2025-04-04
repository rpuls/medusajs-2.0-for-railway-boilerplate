import { ExtractKeysFromConfig, MedusaServiceReturnType, ModelConfigurationsToConfigTemplate, ModelEntries, ModelsConfigTemplate } from "./types/medusa-service";
/**
 * Accessible from the MedusaService, holds the model objects when provided
 */
export declare const MedusaServiceModelObjectsSymbol: unique symbol;
/**
 * Symbol to mark a class as a Medusa service
 */
export declare const MedusaServiceSymbol: unique symbol;
/**
 * Accessible from the MedusaService, holds the model name to linkable keys map
 * to be used for softDelete and restore methods
 */
export declare const MedusaServiceModelNameToLinkableKeysMapSymbol: unique symbol;
/**
 * Check if a value is a Medusa service
 * @param value
 */
export declare function isMedusaService(value: any): value is MedusaServiceReturnType<any>;
/**
 * Factory function for creating an abstract module service
 *
 * @example
 *
 * // Here the DTO's and names will be inferred from the arguments
 *
 * const models = {
 *   Currency,
 *   Price,
 *   PriceList,
 *   PriceListRule,
 *   PriceListRuleValue,
 *   PriceRule,
 *   PriceSetRuleType,
 *   RuleType,
 * }
 *
 * class MyService extends ModulesSdkUtils.MedusaService(models) {}
 *
 * @param models
 */
export declare function MedusaService<const ModelsConfig extends ModelsConfigTemplate = {
    __empty: any;
}, const TModels extends ModelEntries<ExtractKeysFromConfig<ModelsConfig>> = ModelEntries<ExtractKeysFromConfig<ModelsConfig>>>(models: TModels): MedusaServiceReturnType<ModelsConfig extends {
    __empty: any;
} ? ModelConfigurationsToConfigTemplate<TModels> : ModelsConfig>;
//# sourceMappingURL=medusa-service.d.ts.map