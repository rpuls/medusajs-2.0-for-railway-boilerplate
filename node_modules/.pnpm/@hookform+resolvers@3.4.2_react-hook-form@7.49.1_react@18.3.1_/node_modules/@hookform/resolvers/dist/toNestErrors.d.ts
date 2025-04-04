import { FieldErrors, ResolverOptions, FieldValues } from 'react-hook-form';
export declare const isDateObject: (value: unknown) => value is Date;
export declare const isNullOrUndefined: (value: unknown) => value is null | undefined;
export declare const isObjectType: (value: unknown) => value is object;
export declare const isObject: <T extends object>(value: unknown) => value is T;
export declare const isKey: (value: string) => boolean;
export declare const toNestErrors: <TFieldValues extends FieldValues>(errors: FieldErrors, options: ResolverOptions<TFieldValues>) => FieldErrors<TFieldValues>;
