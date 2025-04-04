"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = Module;
const dml_1 = require("../dml");
const joiner_config_builder_1 = require("./joiner-config-builder");
const medusa_service_1 = require("./medusa-service");
/**
 * Wrapper to build the module export and auto generate the joiner config if not already provided in the module service, as well as
 * return a linkable object based on the models
 *
 * @param serviceName
 * @param service
 * @param loaders
 */
function Module(serviceName, { service, loaders }) {
    const modelObjects = service[medusa_service_1.MedusaServiceModelObjectsSymbol] ?? {};
    service.prototype.__joinerConfig ??= () => (0, joiner_config_builder_1.defineJoinerConfig)(serviceName, {
        models: Object.keys(modelObjects).length
            ? Object.values(modelObjects)
            : undefined,
    });
    let linkable = {};
    const dmlObjects = Object.entries(modelObjects).filter(([, model]) => dml_1.DmlEntity.isDmlEntity(model));
    // TODO: Custom joiner config should take precedence over the DML auto generated linkable
    // Thats in the case of manually providing models in custom joiner config.
    // TODO: Add support for non linkable modifier DML object to be skipped from the linkable generation
    const linkableKeys = service.prototype.__joinerConfig().linkableKeys;
    if (dmlObjects.length) {
        linkable = (0, joiner_config_builder_1.buildLinkConfigFromModelObjects)(serviceName, modelObjects, linkableKeys);
    }
    else {
        linkable = (0, joiner_config_builder_1.buildLinkConfigFromLinkableKeys)(serviceName, linkableKeys);
    }
    return {
        service,
        loaders,
        linkable,
    };
}
//# sourceMappingURL=module.js.map