import { BatchWorkflowInput, LinkDefinition } from "@medusajs/framework/types";
import { WorkflowData } from "@medusajs/framework/workflows-sdk";
export declare const batchLinksWorkflowId = "batch-links";
/**
 * This workflow manages one or more links to create, update, or dismiss them.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * manage links within your custom flows.
 *
 * Learn more about links in [this documentation](https://docs.medusajs.com/learn/fundamentals/module-links/link).
 *
 * @example
 * const { result } = await batchLinksWorkflow(container)
 * .run({
 *   input: {
 *     create: [
 *       {
 *         // import { Modules } from "@medusajs/framework/utils"
 *         [Modules.PRODUCT]: {
 *           product_id: "prod_123",
 *         },
 *         "helloModuleService": {
 *           my_custom_id: "mc_123",
 *         },
 *       }
 *     ],
 *     update: [
 *       {
 *         // import { Modules } from "@medusajs/framework/utils"
 *         [Modules.PRODUCT]: {
 *           product_id: "prod_321",
 *         },
 *         "helloModuleService": {
 *           my_custom_id: "mc_321",
 *         },
 *         data: {
 *           metadata: {
 *             test: false
 *           }
 *         }
 *       }
 *     ],
 *     delete: [
 *       {
 *         // import { Modules } from "@medusajs/framework/utils"
 *         [Modules.PRODUCT]: {
 *           product_id: "prod_321",
 *         },
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Manage links between two records of linked data models.
 */
export declare const batchLinksWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<BatchWorkflowInput<LinkDefinition, LinkDefinition, LinkDefinition>, {
    created: (LinkDefinition | WorkflowData<LinkDefinition>)[] & LinkDefinition[] & import("@medusajs/framework/workflows-sdk").WorkflowDataProperties<LinkDefinition[]> & {
        config(config: {
            name?: string;
        } & Omit<import("@medusajs/orchestration").TransactionStepsDefinition, "next" | "uuid" | "action">): WorkflowData<LinkDefinition[]>;
    } & import("@medusajs/framework/workflows-sdk").StepFunctionReturnConfig<LinkDefinition[]>;
    updated: (LinkDefinition | WorkflowData<LinkDefinition>)[] & LinkDefinition[] & import("@medusajs/framework/workflows-sdk").WorkflowDataProperties<LinkDefinition[]> & {
        config(config: {
            name?: string;
        } & Omit<import("@medusajs/orchestration").TransactionStepsDefinition, "next" | "uuid" | "action">): WorkflowData<LinkDefinition[]>;
    } & import("@medusajs/framework/workflows-sdk").StepFunctionReturnConfig<LinkDefinition[]>;
    deleted: (LinkDefinition | WorkflowData<LinkDefinition>)[] & LinkDefinition[] & import("@medusajs/framework/workflows-sdk").WorkflowDataProperties<LinkDefinition[]> & {
        config(config: {
            name?: string;
        } & Omit<import("@medusajs/orchestration").TransactionStepsDefinition, "next" | "uuid" | "action">): WorkflowData<LinkDefinition[]>;
    } & import("@medusajs/framework/workflows-sdk").StepFunctionReturnConfig<LinkDefinition[]>;
}, []>;
//# sourceMappingURL=batch-links.d.ts.map