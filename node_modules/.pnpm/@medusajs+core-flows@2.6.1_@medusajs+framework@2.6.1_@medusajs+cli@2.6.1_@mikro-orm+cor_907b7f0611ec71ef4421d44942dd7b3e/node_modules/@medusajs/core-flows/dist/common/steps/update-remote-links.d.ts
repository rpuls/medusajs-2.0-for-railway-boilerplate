import { LinkDefinition } from "@medusajs/framework/types";
export declare const updateRemoteLinksStepId = "update-remote-links-step";
/**
 * This step updates remote links between two records of linked data models.
 *
 * Learn more in the [Remote Link documentation.](https://docs.medusajs.com/learn/fundamentals/module-links/remote-link#create-link).
 *
 * @example
 * const data = updateRemoteLinksStep([
 *   {
 *     [Modules.PRODUCT]: {
 *       product_id: "prod_321",
 *     },
 *     "helloModuleService": {
 *       my_custom_id: "mc_321",
 *     },
 *     data: {
 *       metadata: {
 *         test: false
 *       }
 *     }
 *   }
 * ])
 */
export declare const updateRemoteLinksStep: import("@medusajs/framework/workflows-sdk").StepFunction<LinkDefinition[], LinkDefinition[]>;
//# sourceMappingURL=update-remote-links.d.ts.map