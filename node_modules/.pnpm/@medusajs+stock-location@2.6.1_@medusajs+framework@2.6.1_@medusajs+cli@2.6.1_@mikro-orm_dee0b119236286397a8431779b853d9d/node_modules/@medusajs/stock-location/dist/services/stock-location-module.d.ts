import { Context, CreateStockLocationInput, DAL, FilterableStockLocationProps, IEventBusService, InferEntityType, InternalModuleDeclaration, IStockLocationService, ModuleJoinerConfig, ModulesSdkTypes, StockLocationAddressInput, StockLocationTypes, UpdateStockLocationInput, UpsertStockLocationAddressInput, UpsertStockLocationInput } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { StockLocation, StockLocationAddress } from "../models";
type InjectedDependencies = {
    [Modules.EVENT_BUS]: IEventBusService;
    baseRepository: DAL.RepositoryService;
    stockLocationService: ModulesSdkTypes.IMedusaInternalService<any>;
    stockLocationAddressService: ModulesSdkTypes.IMedusaInternalService<any>;
};
declare const StockLocationModuleService_base: import("@medusajs/framework/utils").MedusaServiceReturnType<{
    StockLocation: {
        dto: StockLocationTypes.StockLocationDTO;
    };
    StockLocationAddress: {
        dto: StockLocationTypes.StockLocationAddressDTO;
    };
}>;
/**
 * Service for managing stock locations.
 */
export default class StockLocationModuleService extends StockLocationModuleService_base implements IStockLocationService {
    protected readonly moduleDeclaration?: InternalModuleDeclaration | undefined;
    protected readonly eventBusModuleService_: IEventBusService;
    protected baseRepository_: DAL.RepositoryService;
    protected readonly stockLocationService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof StockLocation>>;
    protected readonly stockLocationAddressService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof StockLocationAddress>>;
    constructor({ [Modules.EVENT_BUS]: eventBusModuleService, baseRepository, stockLocationService, stockLocationAddressService, }: InjectedDependencies, moduleDeclaration?: InternalModuleDeclaration | undefined);
    __joinerConfig(): ModuleJoinerConfig;
    createStockLocations(data: CreateStockLocationInput, context: Context): Promise<StockLocationTypes.StockLocationDTO>;
    createStockLocations(data: CreateStockLocationInput[], context: Context): Promise<StockLocationTypes.StockLocationDTO[]>;
    createStockLocations_(data: CreateStockLocationInput[], context?: Context): Promise<InferEntityType<typeof StockLocation>[]>;
    upsertStockLocations(data: UpsertStockLocationInput, context?: Context): Promise<StockLocationTypes.StockLocationDTO>;
    upsertStockLocations(data: UpsertStockLocationInput[], context?: Context): Promise<StockLocationTypes.StockLocationDTO[]>;
    upsertStockLocations_(input: UpsertStockLocationInput[], context?: Context): Promise<{
        id: string;
        name: string;
        metadata: Record<string, unknown> | null;
        address: {
            id: string;
            address_1: string;
            address_2: string | null;
            company: string | null;
            city: string | null;
            country_code: string;
            phone: string | null;
            province: string | null;
            postal_code: string | null;
            metadata: Record<string, unknown> | null;
            stock_locations: any;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
        };
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
        address_id: string | null;
    }[]>;
    updateStockLocations(id: string, input: UpdateStockLocationInput, context?: Context): Promise<StockLocationTypes.StockLocationDTO>;
    updateStockLocations(selector: FilterableStockLocationProps, input: UpdateStockLocationInput, context?: Context): Promise<StockLocationTypes.StockLocationDTO[]>;
    updateStockLocations_(data: UpdateStockLocationInput[] | UpdateStockLocationInput | {
        data: any;
        selector: FilterableStockLocationProps;
    }, context?: Context): Promise<InferEntityType<typeof StockLocation>[] | InferEntityType<typeof StockLocation>>;
    updateStockLocationAddresses(data: StockLocationAddressInput & {
        id: string;
    }, context?: Context): Promise<StockLocationTypes.StockLocationAddressDTO>;
    updateStockLocationAddresses(data: (StockLocationAddressInput & {
        id: string;
    })[], context?: Context): Promise<StockLocationTypes.StockLocationAddressDTO[]>;
    private updateStockLocationAddresses_;
    upsertStockLocationAddresses(data: UpsertStockLocationAddressInput, context?: Context): Promise<StockLocationTypes.StockLocationAddressDTO>;
    upsertStockLocationAddresses(data: UpsertStockLocationAddressInput[], context?: Context): Promise<StockLocationTypes.StockLocationAddressDTO[]>;
    upsertStockLocationAddresses_(input: UpsertStockLocationAddressInput[], context?: Context): Promise<{
        id: string;
        address_1: string;
        address_2: string | null;
        company: string | null;
        city: string | null;
        country_code: string;
        phone: string | null;
        province: string | null;
        postal_code: string | null;
        metadata: Record<string, unknown> | null;
        stock_locations: {
            id: string;
            name: string;
            metadata: Record<string, unknown> | null;
            address: any;
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
            address_id: string | null;
        };
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    }[]>;
}
export {};
//# sourceMappingURL=stock-location-module.d.ts.map