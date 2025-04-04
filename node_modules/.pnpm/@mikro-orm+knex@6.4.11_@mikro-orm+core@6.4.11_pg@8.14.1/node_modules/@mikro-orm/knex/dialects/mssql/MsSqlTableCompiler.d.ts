import { MonkeyPatchable } from '../../MonkeyPatchable';
export declare class MsSqlTableCompiler extends MonkeyPatchable.MsSqlTableCompiler {
    lowerCase: boolean;
    addColumnsPrefix: string;
    dropColumnPrefix: string;
    alterColumnPrefix: string;
    alterColumns(this: any, columns: any, colBuilder: any): void;
    dropForeign(this: any, columns: any, constraintName: any): void;
}
