"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedusaWorkflow = void 0;
class MedusaWorkflow {
    static registerWorkflow(workflowId, exportedWorkflow) {
        if (workflowId in MedusaWorkflow.workflows) {
            return;
        }
        MedusaWorkflow.workflows[workflowId] = exportedWorkflow;
    }
    static getWorkflow(workflowId) {
        return MedusaWorkflow.workflows[workflowId];
    }
}
MedusaWorkflow.workflows = {};
global.MedusaWorkflow ??= MedusaWorkflow;
const GlobalMedusaWorkflow = global.MedusaWorkflow;
exports.MedusaWorkflow = GlobalMedusaWorkflow;
//# sourceMappingURL=medusa-workflow.js.map