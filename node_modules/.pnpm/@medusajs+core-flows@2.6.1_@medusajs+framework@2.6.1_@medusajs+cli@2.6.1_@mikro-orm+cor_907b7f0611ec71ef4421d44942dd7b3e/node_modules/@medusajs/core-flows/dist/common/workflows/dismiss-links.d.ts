import { LinkDefinition } from "@medusajs/framework/types";
export declare const dismissLinksWorkflowId = "dismiss-link";
/**
 * This workflow dismisses one or more links between records.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * dismiss links within your custom flows.
 *
 * Learn more about links in [this documentation](https://docs.medusajs.com/learn/fundamentals/module-links/link).
 *
 * @example
 * const { result } = await dismissLinksWorkflow(container)
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
 *     }
 *   ]
 * })
 *
 * @summary
 *
 * Dismiss links between two records of linked data models.
 */
export declare const dismissLinksWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<LinkDefinition[], LinkDefinition[], []>;
//# sourceMappingURL=dismiss-links.d.ts.map