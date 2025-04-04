import type { FullJson2CsvOptions } from './types';
export declare const Json2Csv: (options: FullJson2CsvOptions) => {
    convert: (data: object[]) => string;
};
