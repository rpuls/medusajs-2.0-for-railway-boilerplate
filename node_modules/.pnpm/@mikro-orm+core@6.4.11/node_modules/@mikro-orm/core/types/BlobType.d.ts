import { Uint8ArrayType } from './Uint8ArrayType';
import type { Platform } from '../platforms';
import type { EntityProperty } from '../typings';
export declare class BlobType extends Uint8ArrayType {
    convertToJSValue(value: Buffer): Buffer | null;
    compareAsType(): string;
    ensureComparable(): boolean;
    getColumnType(prop: EntityProperty, platform: Platform): string;
}
