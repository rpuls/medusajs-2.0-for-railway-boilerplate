import type { EntityClass, FindOneOptions, FindOptions } from "@mikro-orm/core";
import { SqlEntityManager } from "@mikro-orm/postgresql";
export declare const FreeTextSearchFilterKeyPrefix = "freeTextSearch_";
interface FilterArgument {
    value: string;
    fromEntity: string;
}
export declare const mikroOrmFreeTextSearchFilterOptionsFactory: (model: string) => {
    name: string;
    cond: (freeTextSearchArgs: FilterArgument, operation: string, manager: SqlEntityManager, options?: (FindOptions<any, any> | FindOneOptions<any, any>) & {
        visited?: Set<EntityClass<any>>;
    }) => {
        $or?: undefined;
    } | {
        $or: any;
    };
};
export {};
//# sourceMappingURL=mikro-orm-free-text-search-filter.d.ts.map