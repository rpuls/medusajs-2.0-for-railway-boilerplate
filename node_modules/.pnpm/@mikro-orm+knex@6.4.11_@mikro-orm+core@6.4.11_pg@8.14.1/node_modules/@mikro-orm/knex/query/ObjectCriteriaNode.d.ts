import { CriteriaNode } from './CriteriaNode';
import type { ICriteriaNodeProcessOptions, IQueryBuilder } from '../typings';
/**
 * @internal
 */
export declare class ObjectCriteriaNode<T extends object> extends CriteriaNode<T> {
    process(qb: IQueryBuilder<T>, options?: ICriteriaNodeProcessOptions): any;
    unwrap(): any;
    willAutoJoin(qb: IQueryBuilder<T>, alias?: string, options?: ICriteriaNodeProcessOptions): boolean;
    shouldInline(payload: any): boolean;
    private getChildKey;
    private inlineArrayChildPayload;
    private inlineChildPayload;
    private inlineCondition;
    private shouldAutoJoin;
    private autoJoin;
    private isPrefixed;
}
