import { IndexTypes } from "@medusajs/types";
export declare class DataSynchronizer {
    #private;
    constructor(container: Record<string, any>);
    onApplicationStart({ schemaObjectRepresentation, storageProvider, }: {
        lockDuration?: number;
        schemaObjectRepresentation: IndexTypes.SchemaObjectRepresentation;
        storageProvider: IndexTypes.StorageProvider;
    }): void;
    syncEntities(entities: {
        entity: string;
        fields: string;
        fields_hash: string;
    }[], lockDuration?: number): Promise<void>;
    removeEntities(entities: string[], staleOnly?: boolean): Promise<void>;
    syncEntity({ entityName, pagination, ack, }: {
        entityName: string;
        pagination?: {
            cursor?: string;
            updated_at?: string | Date;
            limit?: number;
            batchSize?: number;
        };
        ack: (ack: {
            lastCursor: string | null;
            done?: boolean;
            err?: Error;
        }) => Promise<void>;
    }): Promise<{
        lastCursor: string | null;
        done?: boolean;
        err?: Error;
    }>;
}
//# sourceMappingURL=data-synchronizer.d.ts.map