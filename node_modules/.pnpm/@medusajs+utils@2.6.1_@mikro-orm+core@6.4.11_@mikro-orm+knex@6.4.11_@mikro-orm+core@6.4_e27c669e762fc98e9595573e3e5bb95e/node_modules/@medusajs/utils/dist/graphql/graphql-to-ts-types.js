"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gqlSchemaToTypes = gqlSchemaToTypes;
const core_1 = require("@graphql-codegen/core");
const typescriptPlugin = __importStar(require("@graphql-codegen/typescript"));
const graphql_1 = require("graphql");
const common_1 = require("../common");
function buildEntryPointsTypeMap({ schema, joinerConfigs, }) {
    // build map entry point to there type to be merged and used by the remote query
    return joinerConfigs.flatMap((config) => {
        const aliases = Array.isArray(config.alias)
            ? config.alias
            : config.alias
                ? [config.alias]
                : [];
        return aliases
            .flatMap((alias) => {
            const names = Array.isArray(alias.name) ? alias.name : [alias.name];
            const entity = alias?.["entity"];
            return names.map((aliasItem) => {
                return {
                    entryPoint: aliasItem,
                    entityType: entity
                        ? schema.includes(`export type ${entity} `)
                            ? alias?.["entity"]
                            : "any"
                        : "any",
                };
            });
        })
            .filter(Boolean);
    });
}
async function generateTypes({ outputDir, filename, interfaceName, config, joinerConfigs, }) {
    const fileSystem = new common_1.FileSystem(outputDir);
    let output = 'import "@medusajs/framework/types"\n';
    output += await (0, core_1.codegen)(config);
    const entryPoints = buildEntryPointsTypeMap({ schema: output, joinerConfigs });
    const remoteQueryEntryPoints = `
declare module '@medusajs/framework/types' {
  interface ${interfaceName} {
${entryPoints
        .map((entry) => `    ${entry.entryPoint}: ${entry.entityType}`)
        .join("\n")}
  }
}`;
    output += remoteQueryEntryPoints;
    const barrelFileName = "index.d.ts";
    await fileSystem.create(filename + ".d.ts", output);
    const doesBarrelExists = await fileSystem.exists(barrelFileName);
    if (!doesBarrelExists) {
        await fileSystem.create(barrelFileName, `export * as ${interfaceName}Types from './${filename}'`);
    }
    else {
        const content = await fileSystem.contents(barrelFileName);
        if (!content.includes(`${interfaceName}Types`)) {
            const newContent = `export * as ${interfaceName}Types from './${filename}'\n${content}`;
            await fileSystem.create(barrelFileName, newContent);
        }
    }
}
// TODO: rename from gqlSchemaToTypes to grapthqlToTsTypes
async function gqlSchemaToTypes({ schema, outputDir, filename, joinerConfigs, interfaceName, }) {
    const config = {
        documents: [],
        config: {
            scalars: {
                DateTime: { input: "Date | string", output: "Date | string" },
                JSON: {
                    input: "Record<string, unknown>",
                    output: "Record<string, unknown>",
                },
            },
            avoidOptionals: {
                field: true, // Avoid optional fields in types
            },
        },
        filename: "",
        schema: (0, graphql_1.parse)((0, graphql_1.printSchema)(schema)),
        plugins: [
            // Each plugin should be an object
            {
                typescript: {}, // Here you can pass configuration to the plugin
            },
        ],
        pluginMap: {
            typescript: typescriptPlugin,
        },
    };
    await generateTypes({
        outputDir,
        filename,
        config,
        joinerConfigs,
        interfaceName,
    });
}
//# sourceMappingURL=graphql-to-ts-types.js.map