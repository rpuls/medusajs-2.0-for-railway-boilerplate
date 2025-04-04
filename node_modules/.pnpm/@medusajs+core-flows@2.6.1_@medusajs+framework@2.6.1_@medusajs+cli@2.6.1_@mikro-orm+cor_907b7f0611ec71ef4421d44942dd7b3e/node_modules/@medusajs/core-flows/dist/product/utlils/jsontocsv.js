"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertJsonToCsv = void 0;
const json_2_csv_1 = require("json-2-csv");
const convertJsonToCsv = (data, options) => {
    return (0, json_2_csv_1.json2csv)(data, {
        prependHeader: true,
        sortHeader: options?.sortHeader ?? false,
        arrayIndexesAsKeys: true,
        expandNestedObjects: true,
        expandArrayObjects: true,
        unwindArrays: false,
        preventCsvInjection: true,
        emptyFieldValue: "",
    });
};
exports.convertJsonToCsv = convertJsonToCsv;
//# sourceMappingURL=jsontocsv.js.map