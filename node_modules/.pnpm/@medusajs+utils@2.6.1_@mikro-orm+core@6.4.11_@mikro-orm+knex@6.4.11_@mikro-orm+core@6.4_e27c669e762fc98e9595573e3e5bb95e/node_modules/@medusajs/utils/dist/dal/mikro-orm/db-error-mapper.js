"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbErrorMapper = void 0;
const core_1 = require("@mikro-orm/core");
const common_1 = require("../../common");
function parseValue(value) {
    switch (value) {
        case "t":
            return "true";
        case "f":
            return "false";
        default:
            return value;
    }
}
const dbErrorMapper = (err) => {
    if (err instanceof core_1.NotFoundError) {
        throw new common_1.MedusaError(common_1.MedusaError.Types.NOT_FOUND, err.message);
    }
    if (err instanceof core_1.UniqueConstraintViolationException ||
        err.code === "23505") {
        const info = getConstraintInfo(err);
        if (!info) {
            throw err;
        }
        throw new common_1.MedusaError(common_1.MedusaError.Types.INVALID_DATA, `${(0, common_1.upperCaseFirst)(info.table.split("_").join(" "))} with ${info.keys
            .map((key, i) => `${key}: ${parseValue(info.values[i])}`)
            .join(", ")}, already exists.`);
    }
    if (err instanceof core_1.NotNullConstraintViolationException ||
        err.code === "23502") {
        throw new common_1.MedusaError(common_1.MedusaError.Types.INVALID_DATA, `Cannot set field '${err.column}' of ${(0, common_1.upperCaseFirst)(err.table.split("_").join(" "))} to null`);
    }
    if (err instanceof core_1.InvalidFieldNameException ||
        err.code === "42703") {
        const userFriendlyMessage = err.message.match(/(column.*)/)?.[0];
        throw new common_1.MedusaError(common_1.MedusaError.Types.INVALID_DATA, userFriendlyMessage ?? err.message);
    }
    if (err instanceof core_1.ForeignKeyConstraintViolationException ||
        err.code === "23503") {
        const info = getConstraintInfo(err);
        throw new common_1.MedusaError(common_1.MedusaError.Types.NOT_FOUND, `You tried to set relationship ${info?.keys.map((key, i) => `${key}: ${info.values[i]}`)}, but such entity does not exist`);
    }
    throw err;
};
exports.dbErrorMapper = dbErrorMapper;
const getConstraintInfo = (err) => {
    const detail = err.detail;
    if (!detail) {
        return null;
    }
    const [keys, values] = detail.match(/\([^\(]*\)/g) || [];
    if (!keys || !values) {
        return null;
    }
    return {
        table: err.table.split("_").join(" "),
        keys: keys
            .substring(1, keys.length - 1)
            .split(",")
            .map((k) => k.trim()),
        values: values
            .substring(1, values.length - 1)
            .split(",")
            .map((v) => v.trim()),
    };
};
//# sourceMappingURL=db-error-mapper.js.map