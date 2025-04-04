import { MedusaAppLoader } from "@medusajs/framework";
/**
 * Low-level utility to sync links. This utility is used
 * by the migrate command as-well.
 */
export declare function syncLinks(medusaAppLoader: MedusaAppLoader, { executeAll, executeSafe, }: {
    executeSafe: boolean;
    executeAll: boolean;
}): Promise<void>;
declare const main: ({ directory, executeSafe, executeAll }: {
    directory: any;
    executeSafe: any;
    executeAll: any;
}) => Promise<never>;
export default main;
//# sourceMappingURL=sync-links.d.ts.map