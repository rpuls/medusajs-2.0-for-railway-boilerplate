import { Type } from './Type';
import type { Platform } from '../platforms';
import type { EntityProperty } from '../typings';
/**
 * Type that maps an SQL DECIMAL to a JS string or number.
 */
export declare class DecimalType extends Type<string | number, string> {
    mode?: "number" | "string" | undefined;
    constructor(mode?: "number" | "string" | undefined);
    convertToJSValue(value: string): number | string;
    compareValues(a: string, b: string): boolean;
    private format;
    getColumnType(prop: EntityProperty, platform: Platform): string;
    compareAsType(): string;
}
