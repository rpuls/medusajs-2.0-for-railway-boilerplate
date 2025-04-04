import { MonkeyPatchable } from '../../MonkeyPatchable';
export declare class MsSqlQueryCompiler extends MonkeyPatchable.MsSqlQueryCompiler {
    constructor(client: any, builder: any, formatter: any);
    insert(this: any): any;
    _mergeAnd(this: any): string;
    _mergeWhenMatched(this: any, columns: any, updates: any): string;
    _mergeWhenNotMatched(this: any, columns: any): string;
    _getParameters(this: any, params: any): any;
    _mergeInsertIsEmpty(this: any, insert: any): boolean;
    _mergeOn(this: any, conflict: any): string;
    _insertWithMerge(this: any): string;
}
