"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertRecordsToLinkDefinition = void 0;
const utils_1 = require("@medusajs/utils");
const convertRecordsToLinkDefinition = (links, service) => {
    const linkRelations = service.__joinerConfig.relationships || [];
    const linkDataFields = service.__joinerConfig.extraDataFields || [];
    const results = [];
    for (const link of links) {
        const result = {};
        for (const relation of linkRelations) {
            result[relation.serviceName] = {
                [relation.foreignKey]: link[relation.foreignKey],
            };
        }
        const data = {};
        for (const dataField of linkDataFields) {
            data[dataField] = link[dataField];
        }
        if ((0, utils_1.isPresent)(data)) {
            result.data = data;
        }
        results.push(result);
    }
    return results;
};
exports.convertRecordsToLinkDefinition = convertRecordsToLinkDefinition;
//# sourceMappingURL=convert-data-to-link-definition.js.map