/**
 * The data to validate if sales channels can be deleted.
 */
export type CanDeleteSalesChannelsOrThrowStepInput = {
    /**
     * The IDs of the sales channels to validate.
     */
    ids: string | string[];
};
export declare const canDeleteSalesChannelsOrThrowStepId = "can-delete-sales-channels-or-throw-step";
/**
 * This step validates that the specified sales channels can be deleted.
 * If any of the sales channels are default sales channels for a store,
 * the step will throw an error.
 *
 * @example
 * const data = canDeleteSalesChannelsOrThrowStep({
 *   ids: ["sc_123"]
 * })
 */
export declare const canDeleteSalesChannelsOrThrowStep: import("@medusajs/framework/workflows-sdk").StepFunction<CanDeleteSalesChannelsOrThrowStepInput, boolean>;
//# sourceMappingURL=can-delete-sales-channels.d.ts.map