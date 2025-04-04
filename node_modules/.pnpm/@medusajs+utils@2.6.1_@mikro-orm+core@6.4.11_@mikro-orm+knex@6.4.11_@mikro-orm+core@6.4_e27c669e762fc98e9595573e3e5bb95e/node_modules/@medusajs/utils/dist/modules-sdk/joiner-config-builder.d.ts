import { IDmlEntity, JoinerServiceConfigAlias, ModuleJoinerConfig } from "@medusajs/types";
import { MapToConfig } from "../common";
import { DmlEntity } from "../dml";
import { InferLinkableKeys, InfersLinksConfig } from "./types/links-config";
/**
 * Define joiner config for a module based on the models (object representation or entities) present in the models directory. This action will be sync until
 * we move to at least es2022 to have access to top-leve await.
 *
 * The aliases will be built from the entityQueryingConfig and custom aliases if provided, in case of aliases provided if the methodSuffix is not provided
 * then it will be inferred from the entity name of the alias args.
 *
 * @param serviceName
 * @param alias custom aliases will be merged with the computed aliases from the provided models. Though, if a custom alias correspond to a computed alias for the same model then the custom alias will take place. Also, note that the methodSuffix will be inferred from the entity name if not provided as part of the args.
 * @param schema
 * @param models
 * @param linkableKeys
 * @param primaryKeys
 */
export declare function defineJoinerConfig(serviceName: string, { alias, schema, models, linkableKeys, primaryKeys, }?: {
    alias?: JoinerServiceConfigAlias[];
    schema?: string;
    models?: DmlEntity<any, any>[] | {
        name: string;
    }[];
    linkableKeys?: ModuleJoinerConfig["linkableKeys"];
    primaryKeys?: string[];
}): Omit<ModuleJoinerConfig, "serviceName" | "primaryKeys" | "linkableKeys" | "alias"> & Required<Pick<ModuleJoinerConfig, "serviceName" | "primaryKeys" | "linkableKeys" | "alias">>;
/**
 * From a set of DML objects, build the linkable keys
 *
 * @example
 * const user = model.define("user", {
 *   id: model.id(),
 *   name: model.text(),
 * })
 *
 * const car = model.define("car", {
 *   id: model.id(),
 *   number_plate: model.text().primaryKey(),
 *   test: model.text(),
 * })
 *
 * const linkableKeys = buildLinkableKeysFromDmlObjects([user, car])
 *
 * // output:
 * // {
 * //   user_id: 'User',
 * //   car_number_plate: 'Car',
 * // }
 *
 * @param models
 */
export declare function buildLinkableKeysFromDmlObjects<const T extends DmlEntity<any, any>[], LinkableKeys = InferLinkableKeys<T>>(models: T): LinkableKeys;
/**
 * Build linkable keys from MikroORM objects
 * @deprecated
 * @param models
 */
export declare function buildLinkableKeysFromMikroOrmObjects(models: Function[]): Record<string, string>;
/**
 * Build entities name to linkable keys map
 *
 * @example
 * const user = model.define("user", {
 *   id: model.id(),
 *   name: model.text(),
 * })
 *
 * const car = model.define("car", {
 *   id: model.id(),
 *   number_plate: model.text().primaryKey(),
 *   test: model.text(),
 * })
 *
 * const links = buildLinkConfigFromModelObjects('userService', { user, car })
 *
 * // output:
 * // {
 * //   user: {
 * //     id: {
 * //       serviceName: 'userService', // The name of the module service it originate from
 * //       field: 'user',              // The field name of the entity, the query field is inferred from it as kebab cased singular/plural
 * //       linkable: 'user_id',        // The linkable key
 * //       primaryKey: 'id'            // The primary key if refers to in the original object representation, it will be used to be passed to the filters of the corresponding public service method
 * //     },
 * //     toJSON() { ... }
 * //   },
 * //   car: {
 * //     number_plate: {
 * //       serviceName: 'userService',
 * //       field: 'car',
 * //       linkable: 'car_number_plate',
 * //       primaryKey: 'number_plate'
 * //     },
 * //     toJSON() { ... }
 * //   }
 * // }
 *
 * @param serviceName
 * @param models
 */
export declare function buildLinkConfigFromModelObjects<const ServiceName extends string, const T extends Record<string, IDmlEntity<any, any>>>(serviceName: ServiceName, models: T, linkableKeys?: Record<string, string>): InfersLinksConfig<ServiceName, T>;
/**
 * @deprecated temporary supports for mikro orm entities to get the linkable available from the module export while waiting for the migration to DML
 *
 * @param serviceName
 * @param linkableKeys
 */
export declare function buildLinkConfigFromLinkableKeys<const ServiceName extends string, const T extends Record<string, string>>(serviceName: ServiceName, linkableKeys: T): Record<string, any>;
/**
 * Reversed map from linkableKeys to entity name to linkable keys
 * @param linkableKeys
 */
export declare function buildModelsNameToLinkableKeysMap(linkableKeys: Record<string, string>): MapToConfig;
//# sourceMappingURL=joiner-config-builder.d.ts.map