import { Type } from './Type';
import type { Platform } from '../platforms';
import type { EntityProperty } from '../typings';
/**
 * Type that maps an SQL DOUBLE to a JS string or number.
 */
export declare class DoubleType extends Type<number | string, string> {
    convertToJSValue(value: string): number | string;
    getColumnType(prop: EntityProperty, platform: Platform): string;
    compareAsType(): string;
}
