import { CreateServiceZoneDTO } from "@medusajs/framework/types";
/**
 * The service zones to create.
 */
export type CreateServiceZonesStepInput = CreateServiceZoneDTO[];
export declare const createServiceZonesStepId = "create-service-zones";
/**
 * This step creates one or more service zones.
 */
export declare const createServiceZonesStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateServiceZonesStepInput, import("@medusajs/framework/types").ServiceZoneDTO[]>;
//# sourceMappingURL=create-service-zones.d.ts.map