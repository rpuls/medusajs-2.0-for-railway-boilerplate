import { Type } from './Type';
import type { Platform } from '../platforms';
import type { EntityProperty } from '../typings';
export declare class IntervalType extends Type<string | null | undefined, string | null | undefined> {
    getColumnType(prop: EntityProperty, platform: Platform): string;
    convertToJSValue(value: string | null | undefined, platform: Platform): string | null | undefined;
    convertToDatabaseValue(value: string | null | undefined, platform: Platform): string | null | undefined;
    getDefaultLength(platform: Platform): number;
}
