"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@medusajs/framework/types");
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("../models");
const joiner_config_1 = require("../joiner-config");
class CustomerModuleService extends (0, utils_1.MedusaService)({
    CustomerAddress: _models_1.CustomerAddress,
    Customer: _models_1.Customer,
    CustomerGroup: _models_1.CustomerGroup,
    CustomerGroupCustomer: _models_1.CustomerGroupCustomer,
}) {
    constructor({ baseRepository, customerService, customerAddressService, customerGroupService, customerGroupCustomerService, }, moduleDeclaration) {
        // @ts-ignore
        super(...arguments);
        this.moduleDeclaration = moduleDeclaration;
        this.baseRepository_ = baseRepository;
        this.customerService_ = customerService;
        this.customerAddressService_ = customerAddressService;
        this.customerGroupService_ = customerGroupService;
        this.customerGroupCustomerService_ = customerGroupCustomerService;
    }
    __joinerConfig() {
        return joiner_config_1.joinerConfig;
    }
    async createCustomers(dataOrArray, sharedContext = {}) {
        const customers = await this.createCustomers_(dataOrArray, sharedContext);
        const serialized = await this.baseRepository_.serialize(customers, {
            populate: true,
        });
        return Array.isArray(dataOrArray) ? serialized : serialized[0];
    }
    async createCustomers_(dataOrArray, sharedContext = {}) {
        const data = Array.isArray(dataOrArray) ? dataOrArray : [dataOrArray];
        const customerAttributes = data.map(({ addresses, ...rest }) => {
            return rest;
        });
        const customers = await this.customerService_.create(customerAttributes, sharedContext);
        const addressDataWithCustomerIds = data
            .map(({ addresses }, i) => {
            if (!addresses) {
                return [];
            }
            return addresses.map((address) => ({
                ...address,
                customer_id: customers[i].id,
            }));
        })
            .flat();
        await this.createCustomerAddresses(addressDataWithCustomerIds, sharedContext);
        return customers;
    }
    // @ts-expect-error
    async updateCustomers(idsOrSelector, data, sharedContext = {}) {
        let updateData;
        if ((0, utils_1.isString)(idsOrSelector)) {
            updateData = {
                id: idsOrSelector,
                ...data,
            };
        }
        else if (Array.isArray(idsOrSelector)) {
            updateData = idsOrSelector.map((id) => ({
                id,
                ...data,
            }));
        }
        else {
            updateData = {
                selector: idsOrSelector,
                data: data,
            };
        }
        const customers = await this.customerService_.update(updateData, sharedContext);
        const serialized = await this.baseRepository_.serialize(customers, {
            populate: true,
        });
        return (0, utils_1.isString)(idsOrSelector) ? serialized[0] : serialized;
    }
    // @ts-expect-error
    async createCustomerGroups(dataOrArrayOfData, sharedContext = {}) {
        const groups = await this.customerGroupService_.create(dataOrArrayOfData, sharedContext);
        return await this.baseRepository_.serialize(groups, {
            populate: true,
        });
    }
    // @ts-expect-error
    async updateCustomerGroups(groupIdOrSelector, data, sharedContext = {}) {
        let updateData;
        if ((0, utils_1.isString)(groupIdOrSelector) || Array.isArray(groupIdOrSelector)) {
            const groupIdOrSelectorArray = Array.isArray(groupIdOrSelector)
                ? groupIdOrSelector
                : [groupIdOrSelector];
            updateData = groupIdOrSelectorArray.map((id) => ({
                id,
                ...data,
            }));
        }
        else {
            updateData = {
                selector: groupIdOrSelector,
                data: data,
            };
        }
        const groups = await this.customerGroupService_.update(updateData, sharedContext);
        if ((0, utils_1.isString)(groupIdOrSelector)) {
            return await this.baseRepository_.serialize(groups[0], { populate: true });
        }
        return await this.baseRepository_.serialize(groups, { populate: true });
    }
    async addCustomerToGroup(data, sharedContext = {}) {
        const groupCustomers = await this.customerGroupCustomerService_.create(data, sharedContext);
        if (Array.isArray(data)) {
            return groupCustomers.map((gc) => ({ id: gc.id }));
        }
        return { id: groupCustomers.id };
    }
    // @ts-expect-error
    async createCustomerAddresses(data, sharedContext = {}) {
        const addresses = await this.createCustomerAddresses_(data, sharedContext);
        const serialized = await this.baseRepository_.serialize(addresses, { populate: true });
        if (Array.isArray(data)) {
            return serialized;
        }
        return serialized[0];
    }
    async createCustomerAddresses_(data, sharedContext = {}) {
        return await this.customerAddressService_.create(Array.isArray(data) ? data : [data], sharedContext);
    }
    // @ts-expect-error
    async updateCustomerAddresses(addressIdOrSelector, data, sharedContext = {}) {
        let updateData;
        if ((0, utils_1.isString)(addressIdOrSelector)) {
            updateData = [
                {
                    id: addressIdOrSelector,
                    ...data,
                },
            ];
        }
        else if (Array.isArray(addressIdOrSelector)) {
            updateData = addressIdOrSelector.map((id) => ({
                id,
                ...data,
            }));
        }
        else {
            updateData = {
                selector: addressIdOrSelector,
                data,
            };
        }
        const addresses = await this.customerAddressService_.update(updateData, sharedContext);
        await this.flush(sharedContext);
        const serialized = await this.baseRepository_.serialize(addresses, { populate: true });
        if ((0, utils_1.isString)(addressIdOrSelector)) {
            return serialized[0];
        }
        return serialized;
    }
    async removeCustomerFromGroup(data, sharedContext = {}) {
        const pairs = Array.isArray(data) ? data : [data];
        const groupCustomers = await this.customerGroupCustomerService_.list({
            $or: pairs,
        });
        await this.customerGroupCustomerService_.delete(groupCustomers.map((gc) => gc.id), sharedContext);
    }
    async flush(context) {
        const em = (context.manager ?? context.transactionManager);
        await em.flush();
    }
}
exports.default = CustomerModuleService;
__decorate([
    (0, utils_1.InjectManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerModuleService.prototype, "createCustomers", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerModuleService.prototype, "createCustomers_", null);
__decorate([
    (0, utils_1.InjectTransactionManager)()
    // @ts-expect-error
    ,
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerModuleService.prototype, "updateCustomers", null);
__decorate([
    (0, utils_1.InjectTransactionManager)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerModuleService.prototype, "createCustomerGroups", null);
__decorate([
    (0, utils_1.InjectTransactionManager)()
    // @ts-expect-error
    ,
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerModuleService.prototype, "updateCustomerGroups", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerModuleService.prototype, "addCustomerToGroup", null);
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerModuleService.prototype, "createCustomerAddresses", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerModuleService.prototype, "createCustomerAddresses_", null);
__decorate([
    (0, utils_1.InjectTransactionManager)()
    // @ts-expect-error
    ,
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerModuleService.prototype, "updateCustomerAddresses", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerModuleService.prototype, "removeCustomerFromGroup", null);
//# sourceMappingURL=customer-module.js.map