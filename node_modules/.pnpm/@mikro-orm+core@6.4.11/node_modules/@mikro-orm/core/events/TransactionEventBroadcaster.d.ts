import type { Transaction } from '../connections';
import type { EntityManager } from '../EntityManager';
import type { TransactionEventType } from '../enums';
import type { UnitOfWork } from '../unit-of-work';
export declare class TransactionEventBroadcaster {
    private readonly em;
    private readonly uow?;
    readonly context?: {
        topLevelTransaction?: boolean;
    } | undefined;
    private readonly eventManager;
    constructor(em: EntityManager, uow?: UnitOfWork | undefined, context?: {
        topLevelTransaction?: boolean;
    } | undefined);
    dispatchEvent(event: TransactionEventType, transaction?: Transaction): Promise<void>;
    isTopLevel(): boolean;
}
