import type { Json2CsvOptions, Csv2JsonOptions } from './types';
export type { Json2CsvOptions, Csv2JsonOptions } from './types';
export declare function json2csv(data: object[], options?: Json2CsvOptions): string;
export declare function csv2json(data: string, options?: Csv2JsonOptions): object[];
