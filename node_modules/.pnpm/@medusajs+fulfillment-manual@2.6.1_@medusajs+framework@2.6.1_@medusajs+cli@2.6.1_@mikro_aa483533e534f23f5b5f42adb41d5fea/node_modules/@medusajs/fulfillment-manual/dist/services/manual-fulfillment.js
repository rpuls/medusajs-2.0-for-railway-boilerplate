"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualFulfillmentService = void 0;
const utils_1 = require("@medusajs/framework/utils");
// TODO rework type and DTO's
class ManualFulfillmentService extends utils_1.AbstractFulfillmentProviderService {
    constructor() {
        super();
    }
    async getFulfillmentOptions() {
        return [
            {
                id: "manual-fulfillment",
            },
            {
                id: "manual-fulfillment-return",
                is_return: true,
            },
        ];
    }
    async validateFulfillmentData(optionData, data, context) {
        return data;
    }
    async calculatePrice(optionData, data, context) {
        throw new Error("Manual fulfillment does not support price calculation");
    }
    async canCalculate() {
        return false;
    }
    async validateOption(data) {
        return true;
    }
    async createFulfillment() {
        // No data is being sent anywhere
        return {
            data: {},
            labels: [],
        };
    }
    async cancelFulfillment() {
        return {};
    }
    async createReturnFulfillment() {
        return {
            data: {},
            labels: [],
        };
    }
}
exports.ManualFulfillmentService = ManualFulfillmentService;
ManualFulfillmentService.identifier = "manual";
//# sourceMappingURL=manual-fulfillment.js.map