"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowScheduler = void 0;
const utils_1 = require("@medusajs/utils");
class WorkflowScheduler {
    static setStorage(storage) {
        this.storage = storage;
    }
    async scheduleWorkflow(workflow) {
        const schedule = workflow.options?.schedule;
        if (!schedule) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_ARGUMENT, "Workflow schedule is not defined while registering a scheduled workflow");
        }
        const normalizedSchedule = typeof schedule === "string"
            ? {
                cron: schedule,
                concurrency: "forbid",
            }
            : {
                cron: schedule.cron,
                concurrency: schedule.concurrency || "forbid",
                numberOfExecutions: schedule.numberOfExecutions,
            };
        await WorkflowScheduler.storage.schedule(workflow.id, normalizedSchedule);
    }
    async clearWorkflow(workflow) {
        await WorkflowScheduler.storage.remove(workflow.id);
    }
    async clear() {
        await WorkflowScheduler.storage.removeAll();
    }
}
global.WorkflowScheduler ??= WorkflowScheduler;
const GlobalWorkflowScheduler = global.WorkflowScheduler;
exports.WorkflowScheduler = GlobalWorkflowScheduler;
//# sourceMappingURL=scheduler.js.map