import { LinkDefinition } from "@medusajs/framework/types";
export declare const updateLinksWorkflowId = "update-link";
/**
 * This workflow updates one or more links between records.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update links within your custom flows.
 *
 * Learn more about links in [this documentation](https://docs.medusajs.com/learn/fundamentals/module-links/link).
 *
 * @example
 * const { result } = await updateLinksWorkflow(container)
 * .run({
 *   input: [
 *     {
 *       // import { Modules } from "@medusajs/framework/utils"
 *       [Modules.PRODUCT]: {
 *         product_id: "prod_123",
 *       },
 *       "helloModuleService": {
 *         my_custom_id: "mc_123",
 *       },
 *       data: {
 *         metadata: {
 *           test: false,
 *         },
 *       }
 *     }
 *   ]
 * })
 *
 * @summary
 *
 * Update links between two records of linked data models.
 */
export declare const updateLinksWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<LinkDefinition[], LinkDefinition[], []>;
//# sourceMappingURL=update-links.d.ts.map