"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOneToDecorator = createOneToDecorator;
exports.OneToMany = OneToMany;
const metadata_1 = require("../metadata");
const utils_1 = require("../utils");
const enums_1 = require("../enums");
function createOneToDecorator(entity, mappedBy, options, kind) {
    return function (target, propertyName) {
        options = utils_1.Utils.processDecoratorParameters({ entity, mappedBy, options });
        const meta = metadata_1.MetadataStorage.getMetadataFromDecorator(target.constructor);
        metadata_1.MetadataValidator.validateSingleDecorator(meta, propertyName, kind);
        const property = { name: propertyName, kind };
        meta.properties[propertyName] = Object.assign(meta.properties[propertyName] ?? {}, property, options);
        return utils_1.Utils.propertyDecoratorReturnValue();
    };
}
function OneToMany(entity, mappedBy, options = {}) {
    return createOneToDecorator(entity, mappedBy, options, enums_1.ReferenceKind.ONE_TO_MANY);
}
