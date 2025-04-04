import { ModuleServiceInitializeOptions } from "@medusajs/types";
import { knex } from "@mikro-orm/postgresql";
type Options = ModuleServiceInitializeOptions["database"];
/**
 * Create a new knex (pg in the future) connection which can be reused and shared
 * @param options
 */
export declare function createPgConnection(options: Options): knex.Knex<any, any>;
export declare const isSharedConnectionSymbol: unique symbol;
export {};
//# sourceMappingURL=create-pg-connection.d.ts.map