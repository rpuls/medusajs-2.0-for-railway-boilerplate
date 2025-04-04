import type { EntityProperty } from '../typings';
import type { Platform } from '../platforms/Platform';
import { Type } from './Type';
export declare class UnknownType extends Type<unknown | null | undefined, unknown | null | undefined> {
    getColumnType(prop: EntityProperty, platform: Platform): string;
    get runtimeType(): string;
    compareAsType(): string;
    ensureComparable(): boolean;
}
