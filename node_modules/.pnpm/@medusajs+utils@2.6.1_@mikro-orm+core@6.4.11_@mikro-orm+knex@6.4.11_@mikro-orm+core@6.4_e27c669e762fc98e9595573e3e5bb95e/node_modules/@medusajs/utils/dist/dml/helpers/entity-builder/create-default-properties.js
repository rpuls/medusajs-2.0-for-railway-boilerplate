"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultProperties = createDefaultProperties;
const date_time_1 = require("../../properties/date-time");
function createDefaultProperties() {
    return {
        created_at: new date_time_1.DateTimeProperty(),
        updated_at: new date_time_1.DateTimeProperty(),
        deleted_at: new date_time_1.DateTimeProperty().nullable(),
    };
}
//# sourceMappingURL=create-default-properties.js.map