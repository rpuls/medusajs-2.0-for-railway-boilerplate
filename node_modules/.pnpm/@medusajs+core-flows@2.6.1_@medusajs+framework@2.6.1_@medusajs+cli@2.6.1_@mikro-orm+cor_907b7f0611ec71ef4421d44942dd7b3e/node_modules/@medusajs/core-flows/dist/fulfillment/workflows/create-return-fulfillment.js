"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReturnFulfillmentWorkflow = exports.createReturnFulfillmentWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
const common_1 = require("../../common");
exports.createReturnFulfillmentWorkflowId = "create-return-fulfillment-workflow";
/**
 * This workflow creates a fulfillment for a return. It's used by other return-related workflows,
 * such as {@link createAndCompleteReturnOrderWorkflow}.
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * create a fulfillment for a return within your custom flows.
 *
 * :::note
 *
 * You can retrieve an order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const { result } = await createReturnFulfillmentWorkflow(container)
 * .run({
 *   input: {
 *     location_id: "sloc_123",
 *     provider_id: "provider_123",
 *     delivery_address: {
 *       first_name: "John",
 *       last_name: "Doe",
 *       address_1: "Test street 1",
 *       city: "Stockholm",
 *       country_code: "se",
 *       postal_code: "12345",
 *       phone: "123456789"
 *     },
 *     items: [
 *       {
 *         quantity: 1,
 *         sku: "shirt",
 *         title: "Shirt",
 *         barcode: "123"
 *       }
 *     ],
 *     order: {
 *       id: "order_123"
 *       // other order details...
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Create a fulfillment for a return.
 */
exports.createReturnFulfillmentWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createReturnFulfillmentWorkflowId, (input) => {
    const location = (0, common_1.useRemoteQueryStep)({
        entry_point: "stock_location",
        fields: [
            "id",
            "name",
            "metadata",
            "created_at",
            "updated_at",
            "address.id",
            "address.address_1",
            "address.address_2",
            "address.city",
            "address.country_code",
            "address.phone",
            "address.province",
            "address.postal_code",
            "address.metadata",
        ],
        variables: { id: input.location_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "get-location" });
    const stepInput = (0, workflows_sdk_1.transform)({ input, location }, ({ input, location }) => {
        return {
            ...input,
            location,
        };
    });
    const result = (0, steps_1.createReturnFulfillmentStep)(stepInput);
    return new workflows_sdk_1.WorkflowResponse(result);
});
//# sourceMappingURL=create-return-fulfillment.js.map