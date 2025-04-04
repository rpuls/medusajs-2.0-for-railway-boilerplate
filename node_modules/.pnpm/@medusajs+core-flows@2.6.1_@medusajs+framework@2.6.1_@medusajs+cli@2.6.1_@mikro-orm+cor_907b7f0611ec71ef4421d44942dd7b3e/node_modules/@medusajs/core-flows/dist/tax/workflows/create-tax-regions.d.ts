import { CreateTaxRegionDTO, TaxRegionDTO } from "@medusajs/framework/types";
/**
 * The tax regions to create.
 */
export type CreateTaxRegionsWorkflowInput = CreateTaxRegionDTO[];
/**
 * The created tax regions.
 */
export type CreateTaxRegionsWorkflowOutput = TaxRegionDTO[];
export declare const createTaxRegionsWorkflowId = "create-tax-regions";
/**
 * This workflow creates one or more tax regions. It's used by the
 * [Create Tax Region Admin API Route](https://docs.medusajs.com/api/admin#tax-regions_posttaxregions).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create tax regions in your custom flows.
 *
 * @example
 * const { result } = await createTaxRegionsWorkflow(container)
 * .run({
 *   input: [
 *     {
 *       country_code: "us",
 *     }
 *   ]
 * })
 *
 * @summary
 *
 * Create one or more tax regions.
 */
export declare const createTaxRegionsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateTaxRegionsWorkflowInput, CreateTaxRegionsWorkflowOutput, []>;
//# sourceMappingURL=create-tax-regions.d.ts.map