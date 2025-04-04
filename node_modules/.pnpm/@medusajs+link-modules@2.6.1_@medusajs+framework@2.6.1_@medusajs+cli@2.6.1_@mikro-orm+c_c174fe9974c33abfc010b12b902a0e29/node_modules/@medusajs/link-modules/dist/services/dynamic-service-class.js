"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModuleService = getModuleService;
exports.getReadOnlyModuleService = getReadOnlyModuleService;
const utils_1 = require("@medusajs/framework/utils");
const _services_1 = require(".");
function getModuleService(joinerConfig) {
    const joinerConfig_ = JSON.parse(JSON.stringify(joinerConfig));
    const databaseConfig = joinerConfig_.databaseConfig;
    delete joinerConfig_.databaseConfig;
    // If extraDataFields is not defined, pick the fields to populate and validate from the
    // database config if any fields are provided.
    if (!(0, utils_1.isDefined)(joinerConfig_.extraDataFields)) {
        joinerConfig_.extraDataFields = Object.keys(databaseConfig?.extraFields || {});
    }
    return class LinkService extends _services_1.LinkModuleService {
        __joinerConfig() {
            return joinerConfig_;
        }
    };
}
function getReadOnlyModuleService(joinerConfig) {
    return class ReadOnlyLinkService {
        __joinerConfig() {
            return joinerConfig;
        }
    };
}
//# sourceMappingURL=dynamic-service-class.js.map