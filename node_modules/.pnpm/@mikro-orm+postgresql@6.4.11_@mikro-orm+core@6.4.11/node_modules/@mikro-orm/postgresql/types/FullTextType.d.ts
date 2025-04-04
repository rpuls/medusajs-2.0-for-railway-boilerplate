import { Type, type TransformContext, type RawQueryFragment } from '@mikro-orm/core';
import type { PostgreSqlPlatform } from '../PostgreSqlPlatform';
type FullTextWeight = 'A' | 'B' | 'C' | 'D';
export type WeightedFullTextValue = {
    [K in FullTextWeight]?: string | null;
};
export declare class FullTextType extends Type<string | WeightedFullTextValue, string | null | RawQueryFragment> {
    regconfig: string;
    constructor(regconfig?: string);
    compareAsType(): string;
    getColumnType(): string;
    convertToDatabaseValue(value: string | WeightedFullTextValue, platform: PostgreSqlPlatform, context?: TransformContext | boolean): string | null | RawQueryFragment;
}
export {};
