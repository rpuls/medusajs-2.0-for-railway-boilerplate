import { Type, type TransformContext } from './Type';
import type { EntityProperty } from '../typings';
import type { Platform } from '../platforms';
export declare class ArrayType<T = string> extends Type<T[] | null, string | null> {
    private readonly toJsValue;
    private readonly toDbValue;
    constructor(toJsValue?: (i: string) => T, toDbValue?: (i: T) => string);
    convertToDatabaseValue(value: T[] | null, platform: Platform, context?: TransformContext): string | null;
    convertToJSValue(value: T[] | string | null, platform: Platform): T[] | null;
    compareAsType(): string;
    toJSON(value: T[]): T[];
    getColumnType(prop: EntityProperty, platform: Platform): string;
}
