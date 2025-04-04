"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBigNumberProperties = createBigNumberProperties;
const big_number_1 = require("../../properties/big-number");
const json_1 = require("../../properties/json");
const nullable_1 = require("../../properties/nullable");
function createBigNumberProperties(schema) {
    const schemaWithBigNumber = {};
    for (const [key, property] of Object.entries(schema)) {
        if (big_number_1.BigNumberProperty.isBigNumberProperty(property) ||
            nullable_1.NullableModifier.isNullableModifier(property)) {
            const parsed = property.parse(key);
            if (parsed.dataType?.name !== "bigNumber") {
                continue;
            }
            let jsonProperty = parsed.nullable
                ? new json_1.JSONProperty().nullable()
                : new json_1.JSONProperty();
            if (parsed.computed) {
                jsonProperty = jsonProperty.computed();
            }
            schemaWithBigNumber[`raw_${key}`] = jsonProperty;
        }
    }
    return schemaWithBigNumber;
}
//# sourceMappingURL=create-big-number-properties.js.map