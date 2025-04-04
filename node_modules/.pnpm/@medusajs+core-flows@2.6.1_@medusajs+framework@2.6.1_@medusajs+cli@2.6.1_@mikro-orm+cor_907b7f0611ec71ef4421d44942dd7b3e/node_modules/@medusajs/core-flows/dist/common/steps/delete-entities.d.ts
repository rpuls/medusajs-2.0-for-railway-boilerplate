export interface DeleteEntitiesStepType {
    moduleRegistrationName: string;
    invokeMethod: string;
    compensateMethod: string;
    entityIdentifier?: string;
    data: any[];
}
export declare const deleteEntitiesStepId = "delete-entities-step";
/**
 * This step deletes one or more entities.
 */
export declare const deleteEntitiesStep: import("@medusajs/framework/workflows-sdk").StepFunction<DeleteEntitiesStepType, undefined>;
//# sourceMappingURL=delete-entities.d.ts.map