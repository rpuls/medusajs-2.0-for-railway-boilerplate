import type { Dictionary } from '@mikro-orm/core';
import { MonkeyPatchable } from '../../MonkeyPatchable';
export declare class SqliteTableCompiler extends MonkeyPatchable.Sqlite3DialectTableCompiler {
    foreign(this: any, foreignInfo: Dictionary): void;
    foreignKeys(this: any): string;
}
