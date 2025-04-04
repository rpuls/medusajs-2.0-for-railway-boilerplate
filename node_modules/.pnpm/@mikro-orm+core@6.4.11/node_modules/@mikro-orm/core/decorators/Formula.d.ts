import type { AnyEntity } from '../typings';
import type { PropertyOptions } from './Property';
export declare function Formula<T extends object>(formula: string | ((alias: string) => string), options?: FormulaOptions<T>): (target: AnyEntity, propertyName: string) => any;
export interface FormulaOptions<T> extends PropertyOptions<T> {
}
