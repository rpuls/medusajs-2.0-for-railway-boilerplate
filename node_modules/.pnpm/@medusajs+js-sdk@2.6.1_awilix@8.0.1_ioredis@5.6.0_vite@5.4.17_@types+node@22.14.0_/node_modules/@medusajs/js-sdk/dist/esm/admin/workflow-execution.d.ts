import { HttpTypes } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class WorkflowExecution {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    list(queryParams?: HttpTypes.AdminGetWorkflowExecutionsParams, headers?: ClientHeaders): Promise<HttpTypes.AdminWorkflowExecutionListResponse>;
    retrieve(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminWorkflowExecutionResponse>;
}
//# sourceMappingURL=workflow-execution.d.ts.map