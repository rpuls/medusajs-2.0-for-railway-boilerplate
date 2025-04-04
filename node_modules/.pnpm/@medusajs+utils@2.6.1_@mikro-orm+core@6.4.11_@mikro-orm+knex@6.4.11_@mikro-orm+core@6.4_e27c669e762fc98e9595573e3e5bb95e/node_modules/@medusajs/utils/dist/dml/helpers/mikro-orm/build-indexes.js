"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIndexFields = validateIndexFields;
const core_1 = require("@mikro-orm/core");
const common_1 = require("../../../common");
/*
  The DML should strictly define indexes where the fields provided for the index are
  already present in the schema definition. If not, we throw an error.
*/
function validateIndexFields(MikroORMEntity, index) {
    const fields = index.on;
    if (!fields?.length) {
        throw new Error(`"on" is a required property when applying indexes on a DML entity`);
    }
    const metaData = core_1.MetadataStorage.getMetadataFromDecorator(MikroORMEntity);
    const entityFields = Object.keys(metaData.properties);
    const invalidFields = (0, common_1.arrayDifference)(fields, entityFields);
    if (invalidFields.length) {
        throw new Error(`Cannot apply indexes on fields (${invalidFields.join(", ")}) for model ${MikroORMEntity.name}`);
    }
}
//# sourceMappingURL=build-indexes.js.map