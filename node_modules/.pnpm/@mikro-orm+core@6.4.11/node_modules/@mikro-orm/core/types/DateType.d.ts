import { Type } from './Type';
import type { Platform } from '../platforms';
import type { EntityProperty } from '../typings';
export declare class DateType extends Type<string | null | undefined, string | null | undefined> {
    compareAsType(): string;
    ensureComparable(): boolean;
    convertToJSValue(value: any, platform: Platform): string | null | undefined;
    getColumnType(prop: EntityProperty, platform: Platform): string;
    getDefaultLength(platform: Platform): number;
}
