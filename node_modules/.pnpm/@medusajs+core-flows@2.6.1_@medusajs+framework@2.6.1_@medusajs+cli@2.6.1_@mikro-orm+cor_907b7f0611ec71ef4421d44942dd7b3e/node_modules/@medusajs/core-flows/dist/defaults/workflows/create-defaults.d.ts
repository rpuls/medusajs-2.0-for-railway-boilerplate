export declare const createDefaultsWorkflowID = "create-defaults";
/**
 * This workflow creates default data for a Medusa application, including
 * a default sales channel and store. The Medusa application uses this workflow
 * to create the default data, if not existing, when the application is first started.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create default data within your custom flows, such as seed scripts.
 *
 * @example
 * const { result } = await createDefaultsWorkflow(container)
 * .run()
 *
 * @summary
 *
 * Create default data for a Medusa application.
 */
export declare const createDefaultsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<unknown, import("@medusajs/types").StoreDTO | undefined, []>;
//# sourceMappingURL=create-defaults.d.ts.map