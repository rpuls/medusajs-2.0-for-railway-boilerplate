import { ApiKeyTypes, Context, DAL, FilterableApiKeyProps, FindConfig, IApiKeyModuleService, InferEntityType, InternalModuleDeclaration, ModuleJoinerConfig, ModulesSdkTypes } from "@medusajs/framework/types";
import { ApiKey } from "../models";
import { RevokeApiKeyInput, TokenDTO, UpdateApiKeyInput } from "../types";
type InjectedDependencies = {
    baseRepository: DAL.RepositoryService;
    apiKeyService: ModulesSdkTypes.IMedusaInternalService<any>;
};
declare const ApiKeyModuleService_base: import("@medusajs/framework/utils").MedusaServiceReturnType<{
    ApiKey: {
        dto: ApiKeyTypes.ApiKeyDTO;
    };
}>;
export declare class ApiKeyModuleService extends ApiKeyModuleService_base implements IApiKeyModuleService {
    protected readonly moduleDeclaration: InternalModuleDeclaration;
    protected baseRepository_: DAL.RepositoryService;
    protected readonly apiKeyService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof ApiKey>>;
    constructor({ baseRepository, apiKeyService }: InjectedDependencies, moduleDeclaration: InternalModuleDeclaration);
    __joinerConfig(): ModuleJoinerConfig;
    deleteApiKeys(ids: string | string[], sharedContext?: Context): Promise<void>;
    createApiKeys(data: ApiKeyTypes.CreateApiKeyDTO[], sharedContext?: Context): Promise<ApiKeyTypes.ApiKeyDTO[]>;
    createApiKeys(data: ApiKeyTypes.CreateApiKeyDTO, sharedContext?: Context): Promise<ApiKeyTypes.ApiKeyDTO>;
    protected createApiKeys_(data: ApiKeyTypes.CreateApiKeyDTO[], sharedContext?: Context): Promise<[InferEntityType<typeof ApiKey>[], TokenDTO[]]>;
    upsertApiKeys(data: ApiKeyTypes.UpsertApiKeyDTO[], sharedContext?: Context): Promise<ApiKeyTypes.ApiKeyDTO[]>;
    upsertApiKeys(data: ApiKeyTypes.UpsertApiKeyDTO, sharedContext?: Context): Promise<ApiKeyTypes.ApiKeyDTO>;
    updateApiKeys(id: string, data: ApiKeyTypes.UpdateApiKeyDTO, sharedContext?: Context): Promise<ApiKeyTypes.ApiKeyDTO>;
    updateApiKeys(selector: FilterableApiKeyProps, data: ApiKeyTypes.UpdateApiKeyDTO, sharedContext?: Context): Promise<ApiKeyTypes.ApiKeyDTO[]>;
    protected updateApiKeys_(normalizedInput: UpdateApiKeyInput[], sharedContext?: Context): Promise<InferEntityType<typeof ApiKey>[]>;
    retrieveApiKey(id: string, config?: FindConfig<ApiKeyTypes.ApiKeyDTO>, sharedContext?: Context): Promise<ApiKeyTypes.ApiKeyDTO>;
    listApiKeys(filters?: ApiKeyTypes.FilterableApiKeyProps, config?: FindConfig<ApiKeyTypes.ApiKeyDTO>, sharedContext?: Context): Promise<ApiKeyTypes.ApiKeyDTO[]>;
    listAndCountApiKeys(filters?: ApiKeyTypes.FilterableApiKeyProps, config?: FindConfig<ApiKeyTypes.ApiKeyDTO>, sharedContext?: Context): Promise<[ApiKeyTypes.ApiKeyDTO[], number]>;
    revoke(id: string, data: ApiKeyTypes.RevokeApiKeyDTO, sharedContext?: Context): Promise<ApiKeyTypes.ApiKeyDTO>;
    revoke(selector: FilterableApiKeyProps, data: ApiKeyTypes.RevokeApiKeyDTO, sharedContext?: Context): Promise<ApiKeyTypes.ApiKeyDTO[]>;
    revoke_(normalizedInput: RevokeApiKeyInput[], sharedContext?: Context): Promise<InferEntityType<typeof ApiKey>[]>;
    authenticate(token: string, sharedContext?: Context): Promise<ApiKeyTypes.ApiKeyDTO | false>;
    protected authenticate_(token: string, sharedContext?: Context): Promise<InferEntityType<typeof ApiKey> | false>;
    protected validateCreateApiKeys_(data: ApiKeyTypes.CreateApiKeyDTO[], sharedContext?: Context): Promise<void>;
    protected normalizeUpdateInput_<T>(idOrSelector: string | FilterableApiKeyProps, data: Omit<T, "id">, sharedContext?: Context): Promise<T[]>;
    protected validateRevokeApiKeys_(data: RevokeApiKeyInput[], sharedContext?: Context): Promise<void>;
    protected static generatePublishableKey(): TokenDTO;
    protected static generateSecretKey(): Promise<TokenDTO>;
    protected static calculateHash(token: string, salt: string): Promise<string>;
}
export {};
//# sourceMappingURL=api-key-module-service.d.ts.map