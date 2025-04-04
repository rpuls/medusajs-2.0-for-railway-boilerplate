import { Context, CreateSalesChannelDTO, DAL, FilterableSalesChannelProps, InferEntityType, InternalModuleDeclaration, ISalesChannelModuleService, ModuleJoinerConfig, ModulesSdkTypes, SalesChannelDTO, UpdateSalesChannelDTO, UpsertSalesChannelDTO } from "@medusajs/framework/types";
import { SalesChannel } from "../models";
type InjectedDependencies = {
    baseRepository: DAL.RepositoryService;
    salesChannelService: ModulesSdkTypes.IMedusaInternalService<any>;
};
declare const SalesChannelModuleService_base: import("@medusajs/framework/utils").MedusaServiceReturnType<{
    SalesChannel: {
        dto: SalesChannelDTO;
    };
}>;
export default class SalesChannelModuleService extends SalesChannelModuleService_base implements ISalesChannelModuleService {
    protected readonly moduleDeclaration: InternalModuleDeclaration;
    protected baseRepository_: DAL.RepositoryService;
    protected readonly salesChannelService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof SalesChannel>>;
    constructor({ baseRepository, salesChannelService }: InjectedDependencies, moduleDeclaration: InternalModuleDeclaration);
    __joinerConfig(): ModuleJoinerConfig;
    createSalesChannels(data: CreateSalesChannelDTO[], sharedContext?: Context): Promise<SalesChannelDTO[]>;
    createSalesChannels(data: CreateSalesChannelDTO, sharedContext?: Context): Promise<SalesChannelDTO>;
    createSalesChannels_(data: CreateSalesChannelDTO[], sharedContext: Context): Promise<InferEntityType<typeof SalesChannel>[]>;
    updateSalesChannels(id: string, data: UpdateSalesChannelDTO, sharedContext?: Context): Promise<SalesChannelDTO>;
    updateSalesChannels(selector: FilterableSalesChannelProps, data: UpdateSalesChannelDTO, sharedContext?: Context): Promise<SalesChannelDTO[]>;
    updateSalesChannels_(data: UpdateSalesChannelDTO[], sharedContext: Context): Promise<{
        id: string;
        name: string;
        description: string | null;
        is_disabled: boolean;
        metadata: Record<string, unknown> | null;
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    }[]>;
    upsertSalesChannels(data: UpsertSalesChannelDTO[], sharedContext?: Context): Promise<SalesChannelDTO[]>;
    upsertSalesChannels(data: UpsertSalesChannelDTO, sharedContext?: Context): Promise<SalesChannelDTO>;
}
export {};
//# sourceMappingURL=sales-channel-module.d.ts.map