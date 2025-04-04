import type { LoadedModule } from "@medusajs/types";
/**
 * Creates the "modules-bindings.d.ts" file with container mappings
 * for the modules enabled inside a user's project.
 */
export declare function generateContainerTypes(modules: Record<string, LoadedModule | LoadedModule[]>, { outputDir, interfaceName, }: {
    outputDir: string;
    interfaceName: string;
}): Promise<void>;
//# sourceMappingURL=modules-to-container-types.d.ts.map