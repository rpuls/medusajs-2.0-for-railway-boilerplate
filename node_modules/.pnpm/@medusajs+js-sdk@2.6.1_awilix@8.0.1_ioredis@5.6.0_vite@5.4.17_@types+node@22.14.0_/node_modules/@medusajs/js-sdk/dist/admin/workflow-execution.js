"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecution = void 0;
class WorkflowExecution {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    async list(queryParams, headers) {
        return await this.client.fetch(`/admin/workflows-executions`, {
            query: queryParams,
            headers,
        });
    }
    async retrieve(id, headers) {
        return await this.client.fetch(`/admin/workflows-executions/${id}`, {
            headers,
        });
    }
}
exports.WorkflowExecution = WorkflowExecution;
//# sourceMappingURL=workflow-execution.js.map