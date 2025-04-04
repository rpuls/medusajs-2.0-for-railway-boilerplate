import { Context, CurrencyTypes, DAL, FilterableCurrencyProps, FindConfig, ICurrencyModuleService, InternalModuleDeclaration, ModulesSdkTypes } from "@medusajs/framework/types";
import { Currency } from "../models";
type InjectedDependencies = {
    baseRepository: DAL.RepositoryService;
    currencyService: ModulesSdkTypes.IMedusaInternalService<typeof Currency>;
};
declare const CurrencyModuleService_base: import("@medusajs/framework/utils").MedusaServiceReturnType<{
    Currency: {
        dto: CurrencyTypes.CurrencyDTO;
        model: typeof Currency;
    };
}>;
export default class CurrencyModuleService extends CurrencyModuleService_base implements ICurrencyModuleService {
    protected readonly moduleDeclaration: InternalModuleDeclaration;
    protected baseRepository_: DAL.RepositoryService;
    protected readonly currencyService_: ModulesSdkTypes.IMedusaInternalService<typeof Currency>;
    constructor({ baseRepository, currencyService }: InjectedDependencies, moduleDeclaration: InternalModuleDeclaration);
    retrieveCurrency(code: string, config?: FindConfig<CurrencyTypes.CurrencyDTO>, sharedContext?: Context): Promise<CurrencyTypes.CurrencyDTO>;
    listCurrencies(filters?: FilterableCurrencyProps, config?: FindConfig<CurrencyTypes.CurrencyDTO>, sharedContext?: Context): Promise<CurrencyTypes.CurrencyDTO[]>;
    listAndCountCurrencies(filters?: FilterableCurrencyProps, config?: FindConfig<CurrencyTypes.CurrencyDTO>, sharedContext?: Context): Promise<[CurrencyTypes.CurrencyDTO[], number]>;
    protected static normalizeFilters(filters: FilterableCurrencyProps | undefined): FilterableCurrencyProps | undefined;
}
export {};
//# sourceMappingURL=currency-module-service.d.ts.map