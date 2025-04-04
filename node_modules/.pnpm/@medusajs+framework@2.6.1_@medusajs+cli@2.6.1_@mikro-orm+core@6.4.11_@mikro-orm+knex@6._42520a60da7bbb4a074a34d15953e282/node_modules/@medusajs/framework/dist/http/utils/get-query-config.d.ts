import { FindConfig, QueryConfig, RequestQueryFields } from "@medusajs/types";
export declare function pickByConfig<TModel>(obj: TModel | TModel[], config: FindConfig<TModel>): Partial<TModel> | Partial<TModel>[];
export declare function prepareListQuery<T extends RequestQueryFields, TEntity>(validated: T, queryConfig?: QueryConfig<TEntity> & {
    restricted?: string[];
}): {
    listConfig: {
        select: string[] | undefined;
        relations: string[];
        skip: number;
        take: number;
        order: {
            [k: symbol]: "DESC" | "ASC";
        } | undefined;
    };
    remoteQueryConfig: {
        fields: string[];
        pagination: {
            skip: number;
            take: number;
            order: {
                [k: symbol]: "DESC" | "ASC";
            } | undefined;
        } | {
            skip?: undefined;
            take?: undefined;
            order?: undefined;
        };
    };
};
export declare function prepareRetrieveQuery<T extends RequestQueryFields, TEntity>(validated: T, queryConfig?: QueryConfig<TEntity> & {
    restricted?: string[];
}): {
    retrieveConfig: {
        select: string[] | undefined;
        relations: string[];
    };
    remoteQueryConfig: {
        fields: string[];
        pagination: {};
    };
};
//# sourceMappingURL=get-query-config.d.ts.map