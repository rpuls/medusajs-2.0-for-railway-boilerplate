"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForeignKey = ForeignKey;
const core_1 = require("@mikro-orm/core");
function ForeignKey() {
    return function (target, propertyName) {
        const meta = core_1.MetadataStorage.getMetadataFromDecorator(target.constructor);
        const prop = meta.properties[propertyName] || {};
        prop["isForeignKey"] = true;
        meta.properties[prop.name] = prop;
    };
}
//# sourceMappingURL=foreign-key.js.map