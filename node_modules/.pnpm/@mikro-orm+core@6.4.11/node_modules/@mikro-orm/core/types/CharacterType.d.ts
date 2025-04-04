import { StringType } from './StringType';
import type { Platform } from '../platforms';
import type { EntityProperty } from '../typings';
export declare class CharacterType extends StringType {
    getColumnType(prop: EntityProperty, platform: Platform): string;
    getDefaultLength(platform: Platform): number;
}
