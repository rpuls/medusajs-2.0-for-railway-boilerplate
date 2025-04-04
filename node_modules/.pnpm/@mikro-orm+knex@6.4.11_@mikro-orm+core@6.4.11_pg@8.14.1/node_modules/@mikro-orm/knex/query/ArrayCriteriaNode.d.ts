import { CriteriaNode } from './CriteriaNode';
import type { IQueryBuilder, ICriteriaNodeProcessOptions } from '../typings';
/**
 * @internal
 */
export declare class ArrayCriteriaNode<T extends object> extends CriteriaNode<T> {
    process(qb: IQueryBuilder<T>, options?: ICriteriaNodeProcessOptions): any;
    unwrap(): any;
    willAutoJoin(qb: IQueryBuilder<T>, alias?: string, options?: ICriteriaNodeProcessOptions): any;
}
