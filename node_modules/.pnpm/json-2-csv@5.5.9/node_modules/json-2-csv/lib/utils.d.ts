import type { Json2CsvOptions, Csv2JsonOptions, FullJson2CsvOptions, FullCsv2JsonOptions } from './types';
/**
 * Build the options to be passed to the appropriate function
 * If a user does not provide custom options, then we use our default
 * If options are provided, then we set each valid key that was passed
 */
export declare function buildJ2COptions(opts: Json2CsvOptions): FullJson2CsvOptions;
/**
 * Build the options to be passed to the appropriate function
 * If a user does not provide custom options, then we use our default
 * If options are provided, then we set each valid key that was passed
 */
export declare function buildC2JOptions(opts: Csv2JsonOptions): FullCsv2JsonOptions;
export declare function validate(data: unknown, validationFn: (data: unknown) => boolean, errorMessages: Record<string, string>): boolean;
/**
 * Utility function to deep copy an object, used by the module tests
 */
export declare function deepCopy<T>(obj: T): T;
/**
 * Helper function that determines whether the provided value is a representation
 *   of a string. Given the RFC4180 requirements, that means that the value is
 *   wrapped in value wrap delimiters (usually a quotation mark on each side).
 */
export declare function isStringRepresentation(fieldValue: string, options: FullJson2CsvOptions | FullCsv2JsonOptions): boolean;
/**
 * Helper function that determines whether the provided value is a representation
 *   of a date.
 */
export declare function isDateRepresentation(fieldValue: string): boolean;
/**
 * Helper function that determines the schema differences between two objects.
 */
export declare function computeSchemaDifferences<T>(schemaA: T[], schemaB: T[]): T[];
/**
 * Utility function to check if a field is considered empty so that the emptyFieldValue can be used instead
 */
export declare function isEmptyField(fieldValue: unknown): boolean;
/**
 * Helper function that removes empty field values from an array.
 */
export declare function removeEmptyFields(fields: unknown[]): unknown[];
/**
 * Helper function that retrieves the next n characters from the start index in
 *   the string including the character at the start index. This is used to
 *   check if are currently at an EOL value, since it could be multiple
 *   characters in length (eg. '\r\n')
 */
export declare function getNCharacters(str: string, start: number, n: number): string;
/**
 * Main unwind function which takes an array and a field to unwind.
 */
export declare function unwind<T>(array: T[], field: string): T[];
/**
 * Checks whether value can be converted to a number
 */
export declare function isNumber(value: unknown): boolean;
export declare function isString(value: unknown): boolean;
export declare function isObject(value: unknown): boolean;
export declare function isNull(value: unknown): boolean;
export declare function isUndefined(value: unknown): boolean;
export declare function isError(value: unknown): boolean;
export declare function arrayDifference<T>(a: T[], b: T[]): T[];
export declare function unique<T>(array: T[]): T[];
export declare function flatten<T>(array: T[][]): T[];
/**
 * Used to help avoid incorrect values returned by JSON.parse when converting
 * CSV back to JSON, such as '39e1804' which JSON.parse converts to Infinity
 */
export declare function isInvalid(parsedJson: unknown): boolean;
