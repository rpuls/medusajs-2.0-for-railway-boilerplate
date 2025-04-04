"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitConfirmationProductImportStep = exports.waitConfirmationProductImportStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.waitConfirmationProductImportStepId = "wait-confirmation-product-import";
/**
 * This step waits until a product import is confirmed. It's useful before executing the
 * {@link batchProductsWorkflow}.
 *
 * This step is asynchronous and will make the workflow using it a [Long-Running Workflow](https://docs.medusajs.com/learn/fundamentals/workflows/long-running-workflow).
 */
exports.waitConfirmationProductImportStep = (0, workflows_sdk_1.createStep)({
    name: exports.waitConfirmationProductImportStepId,
    async: true,
    // After an hour we want to timeout and cancel the import so we don't have orphaned workflows
    timeout: 60 * 60 * 1,
}, async () => { });
//# sourceMappingURL=wait-confirmation-product-import.js.map