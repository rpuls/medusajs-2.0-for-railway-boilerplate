import { DeeksOptions } from './types';
export * from './types';
/**
 * Return the deep keys list for a single document
 * @param object
 * @param options
 * @returns {Array}
 */
export declare function deepKeys(object: object, options?: DeeksOptions): string[];
/**
 * Return the deep keys list for all documents in the provided list
 * @param list
 * @param options
 * @returns Array[Array[String]]
 */
export declare function deepKeysFromList(list: object[], options?: DeeksOptions): string[][];
