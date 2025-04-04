import type { IPrimaryKey } from '../typings';
/**
 * @internal
 */
export declare class EntityIdentifier {
    private value?;
    constructor(value?: IPrimaryKey | undefined);
    setValue(value: IPrimaryKey): void;
    getValue<T extends IPrimaryKey = IPrimaryKey>(): T;
}
