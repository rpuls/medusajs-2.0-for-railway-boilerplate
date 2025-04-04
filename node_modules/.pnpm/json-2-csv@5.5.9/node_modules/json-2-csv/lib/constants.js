'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.excelBOM = exports.defaultCsv2JsonOptions = exports.defaultJson2CsvOptions = exports.errors = void 0;
exports.errors = {
    optionsRequired: 'Options were not passed and are required.',
    json2csv: {
        cannotCallOn: 'Cannot call json2csv on',
        dataCheckFailure: 'Data provided was not an array of documents.',
        notSameSchema: 'Not all documents have the same schema.'
    },
    csv2json: {
        cannotCallOn: 'Cannot call csv2json on',
        dataCheckFailure: 'CSV is not a string.'
    }
};
exports.defaultJson2CsvOptions = {
    arrayIndexesAsKeys: false,
    checkSchemaDifferences: false,
    delimiter: {
        field: ',',
        wrap: '"',
        eol: '\n'
    },
    emptyFieldValue: undefined,
    escapeHeaderNestedDots: true,
    excelBOM: false,
    excludeKeys: [],
    expandNestedObjects: true,
    expandArrayObjects: false,
    prependHeader: true,
    preventCsvInjection: false,
    sortHeader: false,
    trimFieldValues: false,
    trimHeaderFields: false,
    unwindArrays: false,
    useDateIso8601Format: false,
    useLocaleFormat: false,
    wrapBooleans: false,
};
exports.defaultCsv2JsonOptions = {
    delimiter: {
        field: ',',
        wrap: '"',
        eol: '\n'
    },
    excelBOM: false,
    preventCsvInjection: false,
    trimFieldValues: false,
    trimHeaderFields: false,
};
exports.excelBOM = '\ufeff';
