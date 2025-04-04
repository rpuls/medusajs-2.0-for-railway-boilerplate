import type { DefaultCsv2JsonOptions, DefaultJson2CsvOptions } from './types';
export declare const errors: {
    optionsRequired: string;
    json2csv: {
        cannotCallOn: string;
        dataCheckFailure: string;
        notSameSchema: string;
    };
    csv2json: {
        cannotCallOn: string;
        dataCheckFailure: string;
    };
};
export declare const defaultJson2CsvOptions: DefaultJson2CsvOptions;
export declare const defaultCsv2JsonOptions: DefaultCsv2JsonOptions;
export declare const excelBOM = "\uFEFF";
