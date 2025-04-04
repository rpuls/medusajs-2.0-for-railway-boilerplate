import { IndexQueryConfig, QueryResultSet } from "./query-config";
import { Subscriber } from "../event-bus";
import { SchemaObjectEntityRepresentation } from "./common";
/**
 * Represents the storage provider interface,
 */
export interface StorageProvider {
    onApplicationStart?(): Promise<void>;
    query<const TEntry extends string>(config: IndexQueryConfig<TEntry>): Promise<QueryResultSet<TEntry>>;
    consumeEvent(schemaEntityObjectRepresentation: SchemaObjectEntityRepresentation): Subscriber<any>;
}
//# sourceMappingURL=sotrage-provider.d.ts.map