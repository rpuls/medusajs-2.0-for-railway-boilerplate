"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCollectionsWorkflow = exports.updateCollectionsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const steps_1 = require("../steps");
exports.updateCollectionsWorkflowId = "update-collections";
/**
 * This workflow updates one or more collections. It's used by the
 * [Create Collection Admin API Route](https://docs.medusajs.com/api/admin#collections_postcollectionsid).
 *
 * This workflow has a hook that allows you to perform custom actions on the updated collections. For example, you can pass under `additional_data` custom data that
 * allows you to update custom data models linked to the product collections.
 *
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around product-collection update.
 *
 * @example
 * const { result } = await updateCollectionsWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "pcol_123"
 *     },
 *     update: {
 *       title: "Summer Collection"
 *     },
 *     additional_data: {
 *       erp_id: "123"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update one or more product collections.
 *
 * @property hooks.collectionsUpdated - This hook is executed after the collections are updated. You can consume this hook to perform custom actions on the updated collections.
 */
exports.updateCollectionsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateCollectionsWorkflowId, (input) => {
    const updatedCollections = (0, steps_1.updateCollectionsStep)(input);
    const collectionIdEvents = (0, workflows_sdk_1.transform)({ updatedCollections }, ({ updatedCollections }) => {
        const arr = Array.isArray(updatedCollections)
            ? updatedCollections
            : [updatedCollections];
        return arr?.map((v) => {
            return { id: v.id };
        });
    });
    (0, common_1.emitEventStep)({
        eventName: utils_1.ProductCollectionWorkflowEvents.UPDATED,
        data: collectionIdEvents,
    });
    const collectionsUpdated = (0, workflows_sdk_1.createHook)("collectionsUpdated", {
        additional_data: input.additional_data,
        collections: updatedCollections,
    });
    return new workflows_sdk_1.WorkflowResponse(updatedCollections, {
        hooks: [collectionsUpdated],
    });
});
//# sourceMappingURL=update-collections.js.map