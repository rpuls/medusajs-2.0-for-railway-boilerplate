import { ModuleJoinerConfig } from "@medusajs/types";
import { type GraphQLSchema } from "graphql";
export declare function gqlSchemaToTypes({ schema, outputDir, filename, joinerConfigs, interfaceName, }: {
    schema: GraphQLSchema;
    outputDir: string;
    filename: string;
    joinerConfigs: ModuleJoinerConfig[];
    interfaceName: string;
}): Promise<void>;
//# sourceMappingURL=graphql-to-ts-types.d.ts.map