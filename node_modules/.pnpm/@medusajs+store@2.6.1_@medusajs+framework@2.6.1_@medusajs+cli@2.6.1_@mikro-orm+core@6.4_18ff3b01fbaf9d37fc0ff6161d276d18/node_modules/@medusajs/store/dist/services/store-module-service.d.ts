import { Context, DAL, InferEntityType, InternalModuleDeclaration, IStoreModuleService, ModulesSdkTypes, StoreTypes } from "@medusajs/framework/types";
import { Store } from "../models";
import { UpdateStoreInput } from "../types";
type InjectedDependencies = {
    baseRepository: DAL.RepositoryService;
    storeService: ModulesSdkTypes.IMedusaInternalService<any>;
};
declare const StoreModuleService_base: import("@medusajs/framework/utils").MedusaServiceReturnType<{
    Store: {
        dto: StoreTypes.StoreDTO;
    };
    StoreCurrency: {
        dto: StoreTypes.StoreCurrencyDTO;
    };
}>;
export default class StoreModuleService extends StoreModuleService_base implements IStoreModuleService {
    protected readonly moduleDeclaration: InternalModuleDeclaration;
    protected baseRepository_: DAL.RepositoryService;
    protected readonly storeService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof Store>>;
    constructor({ baseRepository, storeService }: InjectedDependencies, moduleDeclaration: InternalModuleDeclaration);
    createStores(data: StoreTypes.CreateStoreDTO[], sharedContext?: Context): Promise<StoreTypes.StoreDTO[]>;
    createStores(data: StoreTypes.CreateStoreDTO, sharedContext?: Context): Promise<StoreTypes.StoreDTO>;
    create_(data: StoreTypes.CreateStoreDTO[], sharedContext?: Context): Promise<InferEntityType<typeof Store>[]>;
    upsertStores(data: StoreTypes.UpsertStoreDTO[], sharedContext?: Context): Promise<StoreTypes.StoreDTO[]>;
    upsertStores(data: StoreTypes.UpsertStoreDTO, sharedContext?: Context): Promise<StoreTypes.StoreDTO>;
    updateStores(id: string, data: StoreTypes.UpdateStoreDTO, sharedContext?: Context): Promise<StoreTypes.StoreDTO>;
    updateStores(selector: StoreTypes.FilterableStoreProps, data: StoreTypes.UpdateStoreDTO, sharedContext?: Context): Promise<StoreTypes.StoreDTO[]>;
    protected update_(data: UpdateStoreInput[], sharedContext?: Context): Promise<InferEntityType<typeof Store>[]>;
    private static normalizeInput;
    private static validateCreateRequest;
    private static validateUpdateRequest;
}
export {};
//# sourceMappingURL=store-module-service.d.ts.map