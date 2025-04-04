import type { PropertyOptions } from './Property';
import type { AnyEntity, Dictionary } from '../typings';
export declare function Enum<T extends object>(options?: EnumOptions<AnyEntity> | (() => Dictionary)): (target: AnyEntity, propertyName: string) => any;
export interface EnumOptions<T> extends PropertyOptions<T> {
    items?: (number | string)[] | (() => Dictionary);
    array?: boolean;
    /** for postgres, by default it uses text column with check constraint */
    nativeEnumName?: string;
}
