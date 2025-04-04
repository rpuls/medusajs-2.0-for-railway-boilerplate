import { InferEntityType } from "@medusajs/types";
import { Promotion } from "../../models";
import { CreateApplicationMethodDTO, UpdateApplicationMethodDTO } from "../../types";
export declare const allowedAllocationTargetTypes: string[];
export declare const allowedAllocationTypes: string[];
export declare const allowedAllocationForQuantity: string[];
export declare function validateApplicationMethodAttributes(data: UpdateApplicationMethodDTO | CreateApplicationMethodDTO, promotion: InferEntityType<typeof Promotion>): void;
//# sourceMappingURL=application-method.d.ts.map