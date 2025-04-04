"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLocationFulfillmentSetWorkflow = exports.createLocationFulfillmentSetWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const fulfillment_1 = require("../../fulfillment");
const associate_locations_with_fulfillment_sets_1 = require("../steps/associate-locations-with-fulfillment-sets");
exports.createLocationFulfillmentSetWorkflowId = "create-location-fulfillment-set";
/**
 * This workflow adds a fulfillment set to a stock location. It's used by the
 * [Add Fulfillment Set to Stock Location Admin API Route](https://docs.medusajs.com/api/admin#stock-locations_poststocklocationsidfulfillmentsets).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to add fulfillment sets to a stock location in your custom flows.
 *
 * @example
 * const { result } = await createLocationFulfillmentSetWorkflow(container)
 * .run({
 *   input: {
 *     location_id: "sloc_123",
 *     fulfillment_set_data: {
 *       name: "Shipping",
 *       type: "shipping",
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Add fulfillment set to a stock location.
 */
exports.createLocationFulfillmentSetWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createLocationFulfillmentSetWorkflowId, (input) => {
    const fulfillmentSet = (0, fulfillment_1.createFulfillmentSets)([
        {
            name: input.fulfillment_set_data.name,
            type: input.fulfillment_set_data.type,
        },
    ]);
    const data = (0, workflows_sdk_1.transform)({ input, fulfillmentSet }, (data) => [
        {
            location_id: data.input.location_id,
            fulfillment_set_ids: [data.fulfillmentSet[0].id],
        },
    ]);
    (0, associate_locations_with_fulfillment_sets_1.associateFulfillmentSetsWithLocationStep)({
        input: data,
    });
});
//# sourceMappingURL=create-location-fulfillment-set.js.map