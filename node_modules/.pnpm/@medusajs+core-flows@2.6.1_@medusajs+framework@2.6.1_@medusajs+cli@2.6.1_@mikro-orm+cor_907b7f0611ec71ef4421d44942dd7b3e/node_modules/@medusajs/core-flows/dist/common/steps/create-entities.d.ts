export interface CreateEntitiesStepType {
    moduleRegistrationName: string;
    invokeMethod: string;
    compensateMethod: string;
    entityIdentifier?: string;
    data: any[];
}
export declare const createEntitiesStepId = "create-entities-step";
/**
 * This step creates entities for any given module or resource
 */
export declare const createEntitiesStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateEntitiesStepType, any[]>;
//# sourceMappingURL=create-entities.d.ts.map