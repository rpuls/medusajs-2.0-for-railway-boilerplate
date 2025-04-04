import { MedusaContainer } from "@medusajs/types";
import { MedusaRequest } from "../types";
export declare const refetchEntities: (entryPoint: string, idOrFilter: string | object, scope: MedusaContainer, fields: string[], pagination?: MedusaRequest["queryConfig"]["pagination"]) => Promise<any>;
export declare const refetchEntity: (entryPoint: string, idOrFilter: string | object, scope: MedusaContainer, fields: string[]) => Promise<any>;
//# sourceMappingURL=refetch-entities.d.ts.map