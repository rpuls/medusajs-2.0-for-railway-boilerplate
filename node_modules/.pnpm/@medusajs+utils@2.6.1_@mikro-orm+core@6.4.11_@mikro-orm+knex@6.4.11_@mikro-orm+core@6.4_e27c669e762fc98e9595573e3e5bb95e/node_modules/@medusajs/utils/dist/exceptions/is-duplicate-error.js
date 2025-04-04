"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDuplicateError = void 0;
const postgres_error_1 = require("./postgres-error");
const isDuplicateError = (err) => {
    return err.code === postgres_error_1.PostgresError.DUPLICATE_ERROR;
};
exports.isDuplicateError = isDuplicateError;
//# sourceMappingURL=is-duplicate-error.js.map