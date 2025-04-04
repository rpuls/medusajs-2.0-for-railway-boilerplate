"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertCsvToJson = void 0;
const json_2_csv_1 = require("json-2-csv");
const convertCsvToJson = (data, options) => {
    return (0, json_2_csv_1.csv2json)(data, {
        preventCsvInjection: true,
        delimiter: { field: detectDelimiter(data) },
    });
};
exports.convertCsvToJson = convertCsvToJson;
const delimiters = [",", ";", "|"];
const detectDelimiter = (data) => {
    let delimiter = ",";
    const header = data.split("\n")[0];
    for (const del of delimiters) {
        if (header.split(del).length > 1) {
            delimiter = del;
            break;
        }
    }
    return delimiter;
};
//# sourceMappingURL=csvtojson.js.map