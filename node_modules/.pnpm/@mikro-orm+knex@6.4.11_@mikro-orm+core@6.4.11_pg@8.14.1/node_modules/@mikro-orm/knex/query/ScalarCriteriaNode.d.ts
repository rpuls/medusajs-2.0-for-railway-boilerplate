import { CriteriaNode } from './CriteriaNode';
import type { IQueryBuilder, ICriteriaNodeProcessOptions } from '../typings';
/**
 * @internal
 */
export declare class ScalarCriteriaNode<T extends object> extends CriteriaNode<T> {
    process(qb: IQueryBuilder<T>, options?: ICriteriaNodeProcessOptions): any;
    willAutoJoin<T>(qb: IQueryBuilder<T>, alias?: string, options?: ICriteriaNodeProcessOptions): boolean;
    shouldJoin(): boolean;
}
