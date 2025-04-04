"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManyToOne = ManyToOne;
const metadata_1 = require("../metadata");
const utils_1 = require("../utils");
const enums_1 = require("../enums");
function ManyToOne(entity = {}, options = {}) {
    return function (target, propertyName) {
        options = utils_1.Utils.processDecoratorParameters({ entity, options });
        const meta = metadata_1.MetadataStorage.getMetadataFromDecorator(target.constructor);
        metadata_1.MetadataValidator.validateSingleDecorator(meta, propertyName, enums_1.ReferenceKind.MANY_TO_ONE);
        const property = { name: propertyName, kind: enums_1.ReferenceKind.MANY_TO_ONE };
        meta.properties[propertyName] = Object.assign(meta.properties[propertyName] ?? {}, property, options);
        return utils_1.Utils.propertyDecoratorReturnValue();
    };
}
