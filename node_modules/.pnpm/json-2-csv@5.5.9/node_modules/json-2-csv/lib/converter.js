'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.csv2json = exports.json2csv = void 0;
const constants_1 = require("./constants");
const json2csv_1 = require("./json2csv");
const csv2json_1 = require("./csv2json");
const utils_1 = require("./utils");
function json2csv(data, options) {
    const builtOptions = (0, utils_1.buildJ2COptions)(options ?? {});
    // Validate the parameters before calling the converter's convert function
    (0, utils_1.validate)(data, utils_1.isObject, constants_1.errors.json2csv);
    return (0, json2csv_1.Json2Csv)(builtOptions).convert(data);
}
exports.json2csv = json2csv;
function csv2json(data, options) {
    const builtOptions = (0, utils_1.buildC2JOptions)(options ?? {});
    // Validate the parameters before calling the converter's convert function
    (0, utils_1.validate)(data, utils_1.isString, constants_1.errors.csv2json);
    return (0, csv2json_1.Csv2Json)(builtOptions).convert(data);
}
exports.csv2json = csv2json;
