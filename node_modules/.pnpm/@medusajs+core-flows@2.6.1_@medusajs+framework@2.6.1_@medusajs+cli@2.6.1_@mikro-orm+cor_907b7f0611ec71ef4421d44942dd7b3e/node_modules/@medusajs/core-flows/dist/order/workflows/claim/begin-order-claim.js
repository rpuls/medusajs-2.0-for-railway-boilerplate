"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beginClaimOrderWorkflow = exports.beginClaimOrderWorkflowId = exports.beginClaimOrderValidationStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const create_claims_1 = require("../../steps/claim/create-claims");
const create_order_change_1 = require("../../steps/create-order-change");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that the order associated with the claim isn't canceled.
 * If not valid, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = beginClaimOrderValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 * })
 */
exports.beginClaimOrderValidationStep = (0, workflows_sdk_1.createStep)("begin-claim-order-validation", async function ({ order }) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
});
exports.beginClaimOrderWorkflowId = "begin-claim-order";
/**
 * This workflow creates an order claim in requested state. It's used by the
 * [Create Claim Admin API Route](https://docs.medusajs.com/api/admin#claims_postclaims).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to create a claim
 * for an order in your custom flows.
 *
 * @example
 * const { result } = await beginClaimOrderWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     type: "refund",
 *   }
 * })
 *
 * @summary
 *
 * Create an order claim in requested state.
 */
exports.beginClaimOrderWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.beginClaimOrderWorkflowId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "status"],
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    });
    (0, exports.beginClaimOrderValidationStep)({ order });
    const created = (0, create_claims_1.createOrderClaimsStep)([
        {
            type: input.type,
            order_id: input.order_id,
            metadata: input.metadata,
            created_by: input.created_by,
        },
    ]);
    const orderChangeInput = (0, workflows_sdk_1.transform)({ created, input }, ({ created, input }) => {
        return {
            change_type: "claim",
            order_id: input.order_id,
            claim_id: created[0].id,
            created_by: input.created_by,
            description: input.description,
            internal_note: input.internal_note,
        };
    });
    return new workflows_sdk_1.WorkflowResponse((0, create_order_change_1.createOrderChangeStep)(orderChangeInput));
});
//# sourceMappingURL=begin-order-claim.js.map