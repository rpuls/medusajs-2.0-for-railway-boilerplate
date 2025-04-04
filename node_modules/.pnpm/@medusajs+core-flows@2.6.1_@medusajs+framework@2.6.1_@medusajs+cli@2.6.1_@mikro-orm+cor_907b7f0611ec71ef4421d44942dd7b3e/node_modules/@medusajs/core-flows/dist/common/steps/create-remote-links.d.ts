import { LinkDefinition } from "@medusajs/framework/types";
export declare const createLinksStepId = "create-remote-links";
/**
 * This step creates remote links between two records of linked data models.
 *
 * Learn more in the [Remote Link documentation.](https://docs.medusajs.com/learn/fundamentals/module-links/remote-link#create-link).
 *
 * @example
 * createRemoteLinkStep([{
 *   [Modules.PRODUCT]: {
 *     product_id: "prod_123",
 *   },
 *   "helloModuleService": {
 *     my_custom_id: "mc_123",
 *   },
 * }])
 */
export declare const createRemoteLinkStep: import("@medusajs/framework/workflows-sdk").StepFunction<LinkDefinition[], LinkDefinition[]>;
//# sourceMappingURL=create-remote-links.d.ts.map