"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyChecks = applyChecks;
const core_1 = require("@mikro-orm/core");
/**
 * Defines PostgreSQL constraints using the MikrORM's "@Check"
 * decorator
 */
function applyChecks(MikroORMEntity, entityChecks = []) {
    entityChecks.forEach((check) => {
        (0, core_1.Check)(typeof check === "function"
            ? {
                expression: check,
            }
            : check)(MikroORMEntity);
    });
}
//# sourceMappingURL=apply-checks.js.map