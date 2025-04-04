import type { PropertyOptions } from './Property';
import type { AnyEntity } from '../typings';
export declare function PrimaryKey<T extends object>(options?: PrimaryKeyOptions<T>): (target: AnyEntity, propertyName: string) => any;
export declare function SerializedPrimaryKey<T extends object>(options?: SerializedPrimaryKeyOptions<T>): (target: AnyEntity, propertyName: string) => any;
export interface PrimaryKeyOptions<T> extends PropertyOptions<T> {
}
export interface SerializedPrimaryKeyOptions<T> extends PropertyOptions<T> {
    type?: any;
}
