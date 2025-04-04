"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAndReturnShippingMethodsDataStep = exports.validateAndReturnShippingMethodsDataStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/workflows-sdk");
exports.validateAndReturnShippingMethodsDataStepId = "validate-and-return-shipping-methods-data";
/**
 * This step validates shipping options to ensure they can be applied on a cart.
 * The step either returns the validated data or void.
 *
 * @example
 * const data = validateAndReturnShippingMethodsDataStep({
 *   id: "sm_123",
 *   provider_id: "my_provider",
 *   option_data: {},
 *   method_data: {},
 *   context: {
 *     id: "cart_123",
 *     shipping_address: {
 *       id: "saddr_123",
 *       first_name: "Jane",
 *       last_name: "Smith",
 *       address_1: "456 Elm St",
 *       city: "Shelbyville",
 *       country_code: "us",
 *       postal_code: "67890",
 *     },
 *     items: [
 *       {
 *         variant: {
 *           id: "variant_123",
 *           weight: 1,
 *           length: 1,
 *           height: 1,
 *           width: 1,
 *           material: "wood",
 *           product: {
 *             id: "prod_123"
 *           }
 *         }
 *       }
 *     ],
 *     product: {
 *       id: "prod_123",
 *       collection_id: "pcol_123",
 *       categories: [],
 *       tags: []
 *     },
 *     from_location: {
 *       id: "sloc_123",
 *       first_name: "John",
 *       last_name: "Doe",
 *       address_1: "123 Main St",
 *       city: "Springfield",
 *       country_code: "us",
 *       postal_code: "12345",
 *     },
 *   }
 * })
 */
exports.validateAndReturnShippingMethodsDataStep = (0, workflows_sdk_1.createStep)(exports.validateAndReturnShippingMethodsDataStepId, async (data, { container }) => {
    const optionsToValidate = data ?? [];
    if (!optionsToValidate.length) {
        return new workflows_sdk_1.StepResponse(void 0);
    }
    const fulfillmentModule = container.resolve(utils_1.Modules.FULFILLMENT);
    const validatedData = await (0, utils_1.promiseAll)(optionsToValidate.map(async (option) => {
        const validated = await fulfillmentModule.validateFulfillmentData(option.provider_id, option.option_data, option.method_data, option.context);
        return {
            [option.id]: validated,
        };
    }));
    return new workflows_sdk_1.StepResponse(validatedData);
});
//# sourceMappingURL=validate-shipping-methods-data.js.map