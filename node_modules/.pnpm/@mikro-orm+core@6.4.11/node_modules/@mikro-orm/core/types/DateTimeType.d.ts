import { Type } from './Type';
import type { Platform } from '../platforms';
import type { EntityProperty } from '../typings';
export declare class DateTimeType extends Type<Date, string> {
    getColumnType(prop: EntityProperty, platform: Platform): string;
    compareAsType(): string;
    get runtimeType(): string;
    ensureComparable(): boolean;
    getDefaultLength(platform: Platform): number;
}
