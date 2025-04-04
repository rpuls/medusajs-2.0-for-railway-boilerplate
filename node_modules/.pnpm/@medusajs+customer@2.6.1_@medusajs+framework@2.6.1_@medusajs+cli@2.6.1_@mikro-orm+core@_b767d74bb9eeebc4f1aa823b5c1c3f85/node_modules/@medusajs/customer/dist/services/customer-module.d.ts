import { Context, CustomerAddressDTO, CustomerDTO, CustomerGroupCustomerDTO, CustomerGroupDTO, CustomerTypes, DAL, ICustomerModuleService, InferEntityType, InternalModuleDeclaration, ModuleJoinerConfig, ModulesSdkTypes } from "@medusajs/framework/types";
import { Customer, CustomerAddress, CustomerGroup, CustomerGroupCustomer } from "../models";
type InjectedDependencies = {
    baseRepository: DAL.RepositoryService;
    customerService: ModulesSdkTypes.IMedusaInternalService<any>;
    customerAddressService: ModulesSdkTypes.IMedusaInternalService<any>;
    customerGroupService: ModulesSdkTypes.IMedusaInternalService<any>;
    customerGroupCustomerService: ModulesSdkTypes.IMedusaInternalService<any>;
};
declare const CustomerModuleService_base: import("@medusajs/framework/utils").MedusaServiceReturnType<{
    CustomerAddress: {
        dto: CustomerAddressDTO;
    };
    Customer: {
        dto: CustomerDTO;
    };
    CustomerGroup: {
        dto: CustomerGroupDTO;
    };
    CustomerGroupCustomer: {
        dto: CustomerGroupCustomerDTO;
    };
}>;
export default class CustomerModuleService extends CustomerModuleService_base implements ICustomerModuleService {
    protected readonly moduleDeclaration: InternalModuleDeclaration;
    protected baseRepository_: DAL.RepositoryService;
    protected customerService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof Customer>>;
    protected customerAddressService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof CustomerAddress>>;
    protected customerGroupService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof CustomerGroup>>;
    protected customerGroupCustomerService_: ModulesSdkTypes.IMedusaInternalService<InferEntityType<typeof CustomerGroupCustomer>>;
    constructor({ baseRepository, customerService, customerAddressService, customerGroupService, customerGroupCustomerService, }: InjectedDependencies, moduleDeclaration: InternalModuleDeclaration);
    __joinerConfig(): ModuleJoinerConfig;
    createCustomers(data: CustomerTypes.CreateCustomerDTO, sharedContext?: Context): Promise<CustomerTypes.CustomerDTO>;
    createCustomers(data: CustomerTypes.CreateCustomerDTO[], sharedContext?: Context): Promise<CustomerTypes.CustomerDTO[]>;
    createCustomers_(dataOrArray: CustomerTypes.CreateCustomerDTO | CustomerTypes.CreateCustomerDTO[], sharedContext?: Context): Promise<CustomerTypes.CustomerDTO[]>;
    updateCustomers(customerId: string, data: CustomerTypes.CustomerUpdatableFields, sharedContext?: Context): Promise<CustomerTypes.CustomerDTO>;
    updateCustomers(customerIds: string[], data: CustomerTypes.CustomerUpdatableFields, sharedContext?: Context): Promise<CustomerTypes.CustomerDTO[]>;
    updateCustomers(selector: CustomerTypes.FilterableCustomerProps, data: CustomerTypes.CustomerUpdatableFields, sharedContext?: Context): Promise<CustomerTypes.CustomerDTO[]>;
    createCustomerGroups(dataOrArrayOfData: CustomerTypes.CreateCustomerGroupDTO, sharedContext?: Context): Promise<CustomerTypes.CustomerGroupDTO>;
    createCustomerGroups(dataOrArrayOfData: CustomerTypes.CreateCustomerGroupDTO[], sharedContext?: Context): Promise<CustomerTypes.CustomerGroupDTO[]>;
    updateCustomerGroups(groupId: string, data: CustomerTypes.CustomerGroupUpdatableFields, sharedContext?: Context): Promise<CustomerTypes.CustomerGroupDTO>;
    updateCustomerGroups(groupIds: string[], data: CustomerTypes.CustomerGroupUpdatableFields, sharedContext?: Context): Promise<CustomerTypes.CustomerGroupDTO[]>;
    updateCustomerGroups(selector: CustomerTypes.FilterableCustomerGroupProps, data: CustomerTypes.CustomerGroupUpdatableFields, sharedContext?: Context): Promise<CustomerTypes.CustomerGroupDTO[]>;
    addCustomerToGroup(groupCustomerPair: CustomerTypes.GroupCustomerPair, sharedContext?: Context): Promise<{
        id: string;
    }>;
    addCustomerToGroup(groupCustomerPairs: CustomerTypes.GroupCustomerPair[], sharedContext?: Context): Promise<{
        id: string;
    }[]>;
    createCustomerAddresses(addresses: CustomerTypes.CreateCustomerAddressDTO[], sharedContext?: Context): Promise<CustomerTypes.CustomerAddressDTO[]>;
    createCustomerAddresses(address: CustomerTypes.CreateCustomerAddressDTO, sharedContext?: Context): Promise<CustomerTypes.CustomerAddressDTO>;
    private createCustomerAddresses_;
    updateCustomerAddresses(addressId: string, data: CustomerTypes.UpdateCustomerAddressDTO, sharedContext?: Context): Promise<CustomerTypes.CustomerAddressDTO>;
    updateCustomerAddresses(addressIds: string[], data: CustomerTypes.UpdateCustomerAddressDTO, sharedContext?: Context): Promise<CustomerTypes.CustomerAddressDTO[]>;
    updateCustomerAddresses(selector: CustomerTypes.FilterableCustomerAddressProps, data: CustomerTypes.UpdateCustomerAddressDTO, sharedContext?: Context): Promise<CustomerTypes.CustomerAddressDTO[]>;
    removeCustomerFromGroup(groupCustomerPair: CustomerTypes.GroupCustomerPair, sharedContext?: Context): Promise<void>;
    removeCustomerFromGroup(groupCustomerPairs: CustomerTypes.GroupCustomerPair[], sharedContext?: Context): Promise<void>;
    private flush;
}
export {};
//# sourceMappingURL=customer-module.d.ts.map