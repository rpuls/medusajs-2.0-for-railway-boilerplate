import type { AnyEntity, EntityClass, EntityClassGroup, EntitySchema, MikroORMOptions } from "@mikro-orm/core";
import { DmlEntity } from "../dml";
type Options = Partial<Omit<MikroORMOptions, "entities" | "entitiesTs">> & {
    entities: (string | EntityClass<AnyEntity> | EntityClassGroup<AnyEntity> | EntitySchema | DmlEntity<any, any>)[];
};
type ReturnedOptions = Partial<MikroORMOptions> & {
    entities: MikroORMOptions["entities"];
    migrations: MikroORMOptions["migrations"];
};
/**
 * Defines a MikroORM CLI config based on the provided options.
 * Convert any DML entities to MikroORM entities to be consumed
 * by mikro orm cli.
 *
 * @param moduleName
 * @param options
 */
export declare function defineMikroOrmCliConfig(moduleName: string, options: Options): ReturnedOptions;
export {};
//# sourceMappingURL=mikro-orm-cli-config-builder.d.ts.map