"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Searchable = Searchable;
const core_1 = require("@mikro-orm/core");
function Searchable() {
    return function (target, propertyName) {
        const meta = core_1.MetadataStorage.getMetadataFromDecorator(target.constructor);
        const prop = meta.properties[propertyName] || {};
        prop["searchable"] = true;
        meta.properties[prop.name] = prop;
    };
}
//# sourceMappingURL=searchable.js.map