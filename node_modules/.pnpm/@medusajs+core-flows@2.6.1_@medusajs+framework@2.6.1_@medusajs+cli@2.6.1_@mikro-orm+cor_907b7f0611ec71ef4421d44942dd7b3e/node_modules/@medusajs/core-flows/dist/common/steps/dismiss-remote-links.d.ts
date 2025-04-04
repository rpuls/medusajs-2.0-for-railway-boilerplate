import { LinkDefinition } from "@medusajs/framework/types";
export type DismissRemoteLinksStepInput = LinkDefinition | LinkDefinition[];
export declare const dismissRemoteLinkStepId = "dismiss-remote-links";
/**
 * This step removes remote links between two records of linked data models.
 *
 * Learn more in the [Remote Link documentation.](https://docs.medusajs.com/learn/fundamentals/module-links/remote-link#dismiss-link).
 *
 * @example
 * dismissRemoteLinkStep([{
 *   [Modules.PRODUCT]: {
 *     product_id: "prod_123",
 *   },
 *   "helloModuleService": {
 *     my_custom_id: "mc_123",
 *   },
 * }])
 */
export declare const dismissRemoteLinkStep: import("@medusajs/framework/workflows-sdk").StepFunction<DismissRemoteLinksStepInput, LinkDefinition[]>;
//# sourceMappingURL=dismiss-remote-links.d.ts.map