"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowResponse = void 0;
const utils_1 = require("@medusajs/utils");
/**
 * Workflow response class encapsulates the return value of a workflow
 */
class WorkflowResponse {
    constructor($result, options) {
        this.$result = $result;
        this.options = options;
        this.__type = utils_1.OrchestrationUtils.SymbolMedusaWorkflowResponse;
    }
}
exports.WorkflowResponse = WorkflowResponse;
//# sourceMappingURL=workflow-response.js.map