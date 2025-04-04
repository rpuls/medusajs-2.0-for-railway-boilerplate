import { RemoteFetchDataCallback } from "@medusajs/orchestration";
import { JoinerArgument, JoinerRelationship, LoadedModule, ModuleJoinerConfig, RemoteExpandProperty, RemoteJoinerOptions, RemoteJoinerQuery, RemoteNestedExpands } from "@medusajs/types";
export declare class RemoteQuery {
    private remoteJoiner;
    private modulesMap;
    private customRemoteFetchData?;
    private entitiesMap;
    static traceFetchRemoteData?: (fetcher: () => Promise<any>, serviceName: string, method: string, options: {
        select?: string[];
        relations: string[];
    }) => Promise<any>;
    constructor({ modulesLoaded, customRemoteFetchData, servicesConfig, entitiesMap, }: {
        modulesLoaded?: LoadedModule[];
        customRemoteFetchData?: RemoteFetchDataCallback;
        servicesConfig?: ModuleJoinerConfig[];
        entitiesMap: Map<string, any>;
    });
    getEntitiesMap(): Map<string, any>;
    setFetchDataCallback(remoteFetchData: (expand: RemoteExpandProperty, keyField: string, ids?: (unknown | unknown[])[], relationship?: any) => Promise<{
        data: unknown[] | {
            [path: string]: unknown[];
        };
        path?: string;
    }>): void;
    static getAllFieldsAndRelations(expand: RemoteExpandProperty | RemoteNestedExpands[number], prefix?: string, args?: JoinerArgument): {
        select?: string[];
        relations: string[];
        args: JoinerArgument;
        take?: number | null;
    };
    private hasPagination;
    private buildPagination;
    private fetchRemoteDataBatched;
    remoteFetchData(expand: RemoteExpandProperty, keyField: string, ids?: (unknown | unknown[])[], relationship?: JoinerRelationship): Promise<{
        data: unknown[] | {
            [path: string]: unknown;
        };
        path?: string;
    }>;
    query(query: string | RemoteJoinerQuery | object, variables?: Record<string, unknown>, options?: RemoteJoinerOptions): Promise<any>;
}
//# sourceMappingURL=remote-query.d.ts.map