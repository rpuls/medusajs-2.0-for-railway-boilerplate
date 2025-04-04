"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatException = exports.PostgresError = void 0;
const utils_1 = require("@medusajs/utils");
var PostgresError;
(function (PostgresError) {
    PostgresError["DUPLICATE_ERROR"] = "23505";
    PostgresError["FOREIGN_KEY_ERROR"] = "23503";
    PostgresError["SERIALIZATION_FAILURE"] = "40001";
    PostgresError["NULL_VIOLATION"] = "23502";
})(PostgresError || (exports.PostgresError = PostgresError = {}));
const formatException = (err) => {
    switch (err.code) {
        case PostgresError.DUPLICATE_ERROR:
            return new utils_1.MedusaError(utils_1.MedusaError.Types.DUPLICATE_ERROR, `${err.table.charAt(0).toUpperCase()}${err.table.slice(1)} with ${err.detail.slice(4).replace(/[()=]/g, (s) => {
                return s === "=" ? " " : "";
            })}`);
        case PostgresError.FOREIGN_KEY_ERROR: {
            const matches = /Key \(([\w-\d]+)\)=\(([\w-\d]+)\) is not present in table "(\w+)"/g.exec(err.detail);
            if (matches?.length !== 4) {
                return new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, JSON.stringify(matches));
            }
            return new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `${matches[3]?.charAt(0).toUpperCase()}${matches[3]?.slice(1)} with ${matches[1]} ${matches[2]} does not exist.`);
        }
        case PostgresError.SERIALIZATION_FAILURE: {
            return new utils_1.MedusaError(utils_1.MedusaError.Types.CONFLICT, err?.detail ?? err?.message);
        }
        case PostgresError.NULL_VIOLATION: {
            return new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Can't insert null value in field ${err?.column} on insert in table ${err?.table}`);
        }
        default:
            return err;
    }
};
exports.formatException = formatException;
//# sourceMappingURL=exception-formatter.js.map