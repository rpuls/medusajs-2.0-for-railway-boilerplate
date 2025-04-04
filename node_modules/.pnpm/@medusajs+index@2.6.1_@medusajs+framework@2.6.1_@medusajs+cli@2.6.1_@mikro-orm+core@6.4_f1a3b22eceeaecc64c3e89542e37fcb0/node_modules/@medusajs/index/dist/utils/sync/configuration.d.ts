import { IndexTypes, InferEntityType, Logger } from "@medusajs/types";
import { IndexMetadata } from "../../models";
import { DataSynchronizer } from "../../services/data-synchronizer";
import { IndexMetadataService } from "../../services/index-metadata";
import { IndexSyncService } from "../../services/index-sync";
export declare class Configuration {
    #private;
    constructor({ schemaObjectRepresentation, indexMetadataService, indexSyncService, dataSynchronizer, logger, }: {
        schemaObjectRepresentation: IndexTypes.SchemaObjectRepresentation;
        indexMetadataService: IndexMetadataService;
        indexSyncService: IndexSyncService;
        dataSynchronizer: DataSynchronizer;
        logger: Logger;
    });
    checkChanges(): Promise<InferEntityType<typeof IndexMetadata>[]>;
}
//# sourceMappingURL=configuration.d.ts.map