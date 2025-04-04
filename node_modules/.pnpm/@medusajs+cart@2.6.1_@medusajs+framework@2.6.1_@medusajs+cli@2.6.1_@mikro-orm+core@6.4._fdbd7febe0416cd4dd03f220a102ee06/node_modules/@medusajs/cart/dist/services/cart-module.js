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
const generateMethodForModels = {
    Cart: _models_1.Cart,
    CreditLine: _models_1.CreditLine,
    Address: _models_1.Address,
    LineItem: _models_1.LineItem,
    LineItemAdjustment: _models_1.LineItemAdjustment,
    LineItemTaxLine: _models_1.LineItemTaxLine,
    ShippingMethod: _models_1.ShippingMethod,
    ShippingMethodAdjustment: _models_1.ShippingMethodAdjustment,
    ShippingMethodTaxLine: _models_1.ShippingMethodTaxLine,
};
class CartModuleService extends utils_1.ModulesSdkUtils.MedusaService(generateMethodForModels) {
    constructor({ baseRepository, cartService, addressService, lineItemService, shippingMethodAdjustmentService, shippingMethodService, lineItemAdjustmentService, shippingMethodTaxLineService, lineItemTaxLineService, }, moduleDeclaration) {
        // @ts-ignore
        super(...arguments);
        this.moduleDeclaration = moduleDeclaration;
        this.baseRepository_ = baseRepository;
        this.cartService_ = cartService;
        this.addressService_ = addressService;
        this.lineItemService_ = lineItemService;
        this.shippingMethodAdjustmentService_ = shippingMethodAdjustmentService;
        this.shippingMethodService_ = shippingMethodService;
        this.lineItemAdjustmentService_ = lineItemAdjustmentService;
        this.shippingMethodTaxLineService_ = shippingMethodTaxLineService;
        this.lineItemTaxLineService_ = lineItemTaxLineService;
    }
    shouldIncludeTotals(config) {
        const totalFields = [
            "total",
            "subtotal",
            "tax_total",
            "discount_total",
            "discount_tax_total",
            "original_total",
            "original_tax_total",
            "item_total",
            "item_subtotal",
            "item_tax_total",
            "original_item_total",
            "original_item_subtotal",
            "original_item_tax_total",
            "shipping_total",
            "shipping_subtotal",
            "shipping_tax_total",
            "original_shipping_tax_total",
            "original_shipping_subtotal",
            "original_shipping_total",
        ];
        const includeTotals = (config?.select ?? []).some((field) => totalFields.includes(field));
        if (includeTotals) {
            this.addRelationsToCalculateTotals(config, totalFields);
        }
        return includeTotals;
    }
    addRelationsToCalculateTotals(config, totalFields) {
        config.relations ??= [];
        config.select ??= [];
        const requiredFieldsForTotals = [
            "items",
            "credit_lines",
            "items.tax_lines",
            "items.adjustments",
            "shipping_methods",
            "shipping_methods.tax_lines",
            "shipping_methods.adjustments",
        ];
        config.relations = (0, utils_1.deduplicate)([
            ...config.relations,
            ...requiredFieldsForTotals,
        ]);
        config.select = config.select.filter((field) => {
            return (!requiredFieldsForTotals.some((val) => val.startsWith(field)) && !totalFields.includes(field));
        });
    }
    // @ts-expect-error
    async retrieveCart(id, config, sharedContext) {
        config ??= {};
        const includeTotals = this.shouldIncludeTotals(config);
        const cart = await super.retrieveCart(id, config, sharedContext);
        if (includeTotals) {
            (0, utils_1.createRawPropertiesFromBigNumber)((0, utils_1.decorateCartTotals)(cart));
        }
        return cart;
    }
    // @ts-expect-error
    async listCarts(filters, config, sharedContext) {
        config ??= {};
        const includeTotals = this.shouldIncludeTotals(config);
        const carts = await super.listCarts(filters, config, sharedContext);
        if (includeTotals) {
            carts.forEach((cart) => {
                (0, utils_1.createRawPropertiesFromBigNumber)((0, utils_1.decorateCartTotals)(cart));
            });
        }
        return carts;
    }
    // @ts-expect-error
    async listAndCountCarts(filters, config, sharedContext) {
        config ??= {};
        const includeTotals = this.shouldIncludeTotals(config);
        const [carts, count] = await super.listAndCountCarts(filters, config, sharedContext);
        if (includeTotals) {
            carts.forEach((cart) => {
                (0, utils_1.createRawPropertiesFromBigNumber)((0, utils_1.decorateCartTotals)(cart));
            });
        }
        return [carts, count];
    }
    // @ts-expect-error
    async createCarts(data, sharedContext = {}) {
        const input = Array.isArray(data) ? data : [data];
        const carts = await this.createCarts_(input, sharedContext);
        const result = await this.listCarts({ id: carts.map((p) => p.id) }, {
            relations: ["shipping_address", "billing_address"],
        }, sharedContext);
        return (Array.isArray(data) ? result : result[0]);
    }
    async createCarts_(data, sharedContext = {}) {
        const lineItemsToCreate = [];
        const createdCarts = [];
        for (const { items, ...cart } of data) {
            const [created] = await this.cartService_.create([cart], sharedContext);
            createdCarts.push(created);
            if (items?.length) {
                const cartItems = items.map((item) => {
                    return {
                        ...item,
                        cart_id: created.id,
                    };
                });
                lineItemsToCreate.push(...cartItems);
            }
        }
        if (lineItemsToCreate.length) {
            await this.addLineItemsBulk_(lineItemsToCreate, sharedContext);
        }
        return createdCarts;
    }
    // @ts-expect-error
    async updateCarts(dataOrIdOrSelector, data, sharedContext = {}) {
        const result = await this.updateCarts_(dataOrIdOrSelector, data, sharedContext);
        const serializedResult = await this.baseRepository_.serialize(result);
        return (0, utils_1.isString)(dataOrIdOrSelector) ? serializedResult[0] : serializedResult;
    }
    async updateCarts_(dataOrIdOrSelector, data, sharedContext = {}) {
        let toUpdate = [];
        if ((0, utils_1.isString)(dataOrIdOrSelector)) {
            toUpdate = [
                {
                    id: dataOrIdOrSelector,
                    ...data,
                },
            ];
        }
        else if (Array.isArray(dataOrIdOrSelector)) {
            toUpdate = dataOrIdOrSelector;
        }
        else {
            const carts = await this.cartService_.list({ ...dataOrIdOrSelector }, { select: ["id"] }, sharedContext);
            toUpdate = carts.map((cart) => {
                return {
                    ...data,
                    id: cart.id,
                };
            });
        }
        const result = await this.cartService_.update(toUpdate, sharedContext);
        return result;
    }
    // @ts-expect-error
    async updateShippingMethods(data, sharedContext) {
        return super.updateShippingMethods(data, sharedContext);
    }
    async addLineItems(cartIdOrData, data, sharedContext = {}) {
        let items = [];
        if ((0, utils_1.isString)(cartIdOrData)) {
            items = await this.addLineItems_(cartIdOrData, data, sharedContext);
        }
        else {
            const data = Array.isArray(cartIdOrData) ? cartIdOrData : [cartIdOrData];
            items = await this.addLineItemsBulk_(data, sharedContext);
        }
        return await this.baseRepository_.serialize(items);
    }
    async addLineItems_(cartId, items, sharedContext = {}) {
        const cart = await this.retrieveCart(cartId, { select: ["id"] }, sharedContext);
        const toUpdate = items.map((item) => {
            return {
                ...item,
                cart_id: cart.id,
            };
        });
        return await this.addLineItemsBulk_(toUpdate, sharedContext);
    }
    async addLineItemsBulk_(data, sharedContext = {}) {
        return await this.lineItemService_.create(data, sharedContext);
    }
    // @ts-expect-error
    async updateLineItems(lineItemIdOrDataOrSelector, data, sharedContext = {}) {
        let items = [];
        if ((0, utils_1.isString)(lineItemIdOrDataOrSelector)) {
            const item = await this.updateLineItem_(lineItemIdOrDataOrSelector, data, sharedContext);
            return await this.baseRepository_.serialize(item);
        }
        else if (Array.isArray(lineItemIdOrDataOrSelector) && !data) {
            // We received an array of data including the ids
            const items = await this.lineItemService_.update(lineItemIdOrDataOrSelector, sharedContext);
            return await this.baseRepository_.serialize(items);
        }
        const toUpdate = Array.isArray(lineItemIdOrDataOrSelector)
            ? lineItemIdOrDataOrSelector
            : [
                {
                    selector: lineItemIdOrDataOrSelector,
                    data: data,
                },
            ];
        items = await this.updateLineItemsWithSelector_(toUpdate, sharedContext);
        return await this.baseRepository_.serialize(items);
    }
    async updateLineItem_(lineItemId, data, sharedContext = {}) {
        const [item] = await this.lineItemService_.update([{ id: lineItemId, ...data }], sharedContext);
        return item;
    }
    async updateLineItemsWithSelector_(updates, sharedContext = {}) {
        let toUpdate = [];
        for (const { selector, data } of updates) {
            const items = await this.listLineItems({ ...selector }, {}, sharedContext);
            items.forEach((item) => {
                toUpdate.push({
                    ...data,
                    id: item.id,
                });
            });
        }
        return await this.lineItemService_.update(toUpdate, sharedContext);
    }
    // @ts-expect-error
    async createAddresses(data, sharedContext = {}) {
        const input = Array.isArray(data) ? data : [data];
        const addresses = await this.createAddresses_(input, sharedContext);
        const result = await this.listAddresses({ id: addresses.map((p) => p.id) }, {}, sharedContext);
        return (Array.isArray(data) ? result : result[0]);
    }
    async createAddresses_(data, sharedContext = {}) {
        return await this.addressService_.create(data, sharedContext);
    }
    // @ts-expect-error
    async updateAddresses(data, sharedContext = {}) {
        const input = Array.isArray(data) ? data : [data];
        const addresses = await this.updateAddresses_(input, sharedContext);
        const result = await this.listAddresses({ id: addresses.map((p) => p.id) }, {}, sharedContext);
        return (Array.isArray(data) ? result : result[0]);
    }
    async updateAddresses_(data, sharedContext = {}) {
        return await this.addressService_.update(data, sharedContext);
    }
    async addShippingMethods(cartIdOrData, data, sharedContext = {}) {
        let methods;
        if ((0, utils_1.isString)(cartIdOrData)) {
            methods = await this.addShippingMethods_(cartIdOrData, data, sharedContext);
        }
        else {
            const data = Array.isArray(cartIdOrData) ? cartIdOrData : [cartIdOrData];
            methods = await this.addShippingMethodsBulk_(data, sharedContext);
        }
        return await this.baseRepository_.serialize(methods);
    }
    async addShippingMethods_(cartId, data, sharedContext = {}) {
        const cart = await this.retrieveCart(cartId, { select: ["id"] }, sharedContext);
        const methods = data.map((method) => {
            return {
                ...method,
                cart_id: cart.id,
            };
        });
        return await this.addShippingMethodsBulk_(methods, sharedContext);
    }
    async addShippingMethodsBulk_(data, sharedContext = {}) {
        return await this.shippingMethodService_.create(data, sharedContext);
    }
    async addLineItemAdjustments(cartIdOrData, adjustments, sharedContext = {}) {
        let addedAdjustments = [];
        if ((0, utils_1.isString)(cartIdOrData)) {
            const cart = await this.retrieveCart(cartIdOrData, { select: ["id"], relations: ["items"] }, sharedContext);
            const lineIds = cart.items?.map((item) => item.id);
            for (const adj of adjustments || []) {
                if (!lineIds?.includes(adj.item_id)) {
                    throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Line item with id ${adj.item_id} does not exist on cart with id ${cartIdOrData}`);
                }
            }
            addedAdjustments = await this.lineItemAdjustmentService_.create(adjustments, sharedContext);
        }
        else {
            const data = Array.isArray(cartIdOrData) ? cartIdOrData : [cartIdOrData];
            addedAdjustments = await this.lineItemAdjustmentService_.create(data, sharedContext);
        }
        return await this.baseRepository_.serialize(addedAdjustments);
    }
    async upsertLineItemTaxLines(taxLines, sharedContext = {}) {
        const result = await this.lineItemTaxLineService_.upsert(taxLines, sharedContext);
        return await this.baseRepository_.serialize(result);
    }
    async upsertLineItemAdjustments(adjustments, sharedContext = {}) {
        let result = await this.lineItemAdjustmentService_.upsert(adjustments, sharedContext);
        return await this.baseRepository_.serialize(result);
    }
    async upsertShippingMethodTaxLines(taxLines, sharedContext = {}) {
        const result = await this.shippingMethodTaxLineService_.upsert(taxLines, sharedContext);
        return await this.baseRepository_.serialize(result);
    }
    async upsertShippingMethodAdjustments(adjustments, sharedContext = {}) {
        const result = await this.shippingMethodAdjustmentService_.upsert(adjustments, sharedContext);
        return await this.baseRepository_.serialize(result);
    }
    async setLineItemAdjustments(cartId, adjustments, sharedContext = {}) {
        const cart = await this.retrieveCart(cartId, { select: ["id"], relations: ["items.adjustments"] }, sharedContext);
        const existingAdjustments = await this.listLineItemAdjustments({ item: { cart_id: cart.id } }, { select: ["id"] }, sharedContext);
        const adjustmentsSet = new Set(adjustments
            .map((a) => a.id)
            .filter(Boolean));
        const toDelete = [];
        // From the existing adjustments, find the ones that are not passed in adjustments
        existingAdjustments.forEach((adj) => {
            if (!adjustmentsSet.has(adj.id)) {
                toDelete.push(adj);
            }
        });
        if (toDelete.length) {
            await this.lineItemAdjustmentService_.softDelete(toDelete.map((adj) => adj.id), sharedContext);
        }
        let result = await this.lineItemAdjustmentService_.upsert(adjustments, sharedContext);
        return await this.baseRepository_.serialize(result);
    }
    async setShippingMethodAdjustments(cartId, adjustments, sharedContext = {}) {
        const cart = await this.retrieveCart(cartId, { select: ["id"], relations: ["shipping_methods.adjustments"] }, sharedContext);
        const existingAdjustments = await this.listShippingMethodAdjustments({ shipping_method: { cart_id: cart.id } }, { select: ["id"] }, sharedContext);
        const adjustmentsSet = new Set(adjustments
            .map((a) => a?.id)
            .filter(Boolean));
        const toDelete = [];
        // From the existing adjustments, find the ones that are not passed in adjustments
        existingAdjustments.forEach((adj) => {
            if (!adjustmentsSet.has(adj.id)) {
                toDelete.push(adj);
            }
        });
        if (toDelete.length) {
            await this.shippingMethodAdjustmentService_.softDelete(toDelete.map((adj) => adj.id), sharedContext);
        }
        const result = await this.shippingMethodAdjustmentService_.upsert(adjustments, sharedContext);
        return await this.baseRepository_.serialize(result);
    }
    async addShippingMethodAdjustments(cartIdOrData, adjustments, sharedContext = {}) {
        let addedAdjustments = [];
        if ((0, utils_1.isString)(cartIdOrData)) {
            const cart = await this.retrieveCart(cartIdOrData, { select: ["id"], relations: ["shipping_methods"] }, sharedContext);
            const methodIds = cart.shipping_methods?.map((method) => method.id);
            for (const adj of adjustments || []) {
                if (!methodIds?.includes(adj.shipping_method_id)) {
                    throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Shipping method with id ${adj.shipping_method_id} does not exist on cart with id ${cartIdOrData}`);
                }
            }
            addedAdjustments = await this.shippingMethodAdjustmentService_.create(adjustments, sharedContext);
        }
        else {
            const data = Array.isArray(cartIdOrData) ? cartIdOrData : [cartIdOrData];
            addedAdjustments = await this.shippingMethodAdjustmentService_.create(data, sharedContext);
        }
        if ((0, utils_1.isObject)(cartIdOrData)) {
            return await this.baseRepository_.serialize(addedAdjustments[0], {});
        }
        return await this.baseRepository_.serialize(addedAdjustments);
    }
    async addLineItemTaxLines(cartIdOrData, taxLines, sharedContext = {}) {
        let addedTaxLines;
        if ((0, utils_1.isString)(cartIdOrData)) {
            // existence check
            await this.retrieveCart(cartIdOrData, { select: ["id"] }, sharedContext);
            const lines = Array.isArray(taxLines) ? taxLines : [taxLines];
            addedTaxLines = await this.lineItemTaxLineService_.create(lines, sharedContext);
        }
        else {
            const data = Array.isArray(cartIdOrData) ? cartIdOrData : [cartIdOrData];
            addedTaxLines = await this.lineItemTaxLineService_.create(data, sharedContext);
        }
        const serialized = await this.baseRepository_.serialize(addedTaxLines);
        if ((0, utils_1.isObject)(cartIdOrData)) {
            return serialized[0];
        }
        return serialized;
    }
    async setLineItemTaxLines(cartId, taxLines, sharedContext = {}) {
        const normalizedTaxLines = taxLines.map((taxLine) => {
            // Pre generate the id so that we can optimized the actions below
            taxLine.id = (0, utils_1.generateEntityId)(taxLine.id, "calitxl");
            return taxLine;
        });
        const taxLineIdsSet = new Set(normalizedTaxLines.map((taxLine) => taxLine?.id));
        const deleteConstraints = {
            item: { cart_id: cartId },
        };
        if (taxLineIdsSet.size) {
            deleteConstraints.id = {
                $nin: Array.from(taxLineIdsSet),
            };
        }
        const [result] = await (0, utils_1.promiseAll)([
            normalizedTaxLines.length
                ? this.lineItemTaxLineService_.upsert(normalizedTaxLines, sharedContext)
                : [],
            this.lineItemTaxLineService_.softDelete(deleteConstraints, sharedContext),
        ]);
        return await this.baseRepository_.serialize(result);
    }
    async addShippingMethodTaxLines(cartIdOrData, taxLines, sharedContext = {}) {
        let addedTaxLines;
        if ((0, utils_1.isString)(cartIdOrData)) {
            // existence check
            await this.retrieveCart(cartIdOrData, { select: ["id"] }, sharedContext);
            const lines = Array.isArray(taxLines) ? taxLines : [taxLines];
            addedTaxLines = await this.shippingMethodTaxLineService_.create(lines, sharedContext);
        }
        else {
            addedTaxLines = await this.shippingMethodTaxLineService_.create(taxLines, sharedContext);
        }
        const serialized = await this.baseRepository_.serialize(addedTaxLines[0]);
        if ((0, utils_1.isObject)(cartIdOrData)) {
            return serialized[0];
        }
        return serialized;
    }
    async setShippingMethodTaxLines(cartId, taxLines, sharedContext = {}) {
        const normalizedTaxLines = taxLines.map((taxLine) => {
            taxLine.id = (0, utils_1.generateEntityId)(taxLine.id, "casmtxl");
            return taxLine;
        });
        const taxLineIdsSet = new Set(normalizedTaxLines.map((taxLine) => taxLine?.id));
        const deleteConstraints = {
            shipping_method: { cart_id: cartId },
        };
        if (taxLineIdsSet.size) {
            deleteConstraints.id = {
                $nin: Array.from(taxLineIdsSet),
            };
        }
        const [result] = await (0, utils_1.promiseAll)([
            taxLines.length
                ? this.shippingMethodTaxLineService_.upsert(taxLines, sharedContext)
                : [],
            this.shippingMethodTaxLineService_.softDelete(deleteConstraints, sharedContext),
        ]);
        return await this.baseRepository_.serialize(result);
    }
}
exports.default = CartModuleService;
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "createCarts", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "createCarts_", null);
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "updateCarts", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "updateCarts_", null);
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "updateShippingMethods", null);
__decorate([
    (0, utils_1.InjectManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "addLineItems", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "addLineItems_", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "addLineItemsBulk_", null);
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "updateLineItems", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "updateLineItem_", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "updateLineItemsWithSelector_", null);
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "createAddresses", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "createAddresses_", null);
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "updateAddresses", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "updateAddresses_", null);
__decorate([
    (0, utils_1.InjectManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "addShippingMethods", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "addShippingMethods_", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "addShippingMethodsBulk_", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "addLineItemAdjustments", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "upsertLineItemTaxLines", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "upsertLineItemAdjustments", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "upsertShippingMethodTaxLines", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "upsertShippingMethodAdjustments", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "setLineItemAdjustments", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "setShippingMethodAdjustments", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "addShippingMethodAdjustments", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "addLineItemTaxLines", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "setLineItemTaxLines", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "addShippingMethodTaxLines", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], CartModuleService.prototype, "setShippingMethodTaxLines", null);
//# sourceMappingURL=cart-module.js.map