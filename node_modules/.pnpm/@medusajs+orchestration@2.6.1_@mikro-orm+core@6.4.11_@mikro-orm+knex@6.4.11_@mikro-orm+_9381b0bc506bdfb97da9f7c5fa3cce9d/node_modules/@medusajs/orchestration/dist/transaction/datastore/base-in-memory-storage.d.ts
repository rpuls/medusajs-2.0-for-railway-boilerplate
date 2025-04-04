import { TransactionCheckpoint } from "../distributed-transaction";
import { TransactionOptions } from "../types";
import { DistributedTransactionStorage } from "./abstract-storage";
export declare class BaseInMemoryDistributedTransactionStorage extends DistributedTransactionStorage {
    private storage;
    constructor();
    get(key: string, options?: TransactionOptions): Promise<TransactionCheckpoint | undefined>;
    list(): Promise<TransactionCheckpoint[]>;
    save(key: string, data: TransactionCheckpoint, ttl?: number, options?: TransactionOptions): Promise<void>;
}
//# sourceMappingURL=base-in-memory-storage.d.ts.map