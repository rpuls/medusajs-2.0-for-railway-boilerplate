"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneToOne = OneToOne;
const enums_1 = require("../enums");
const OneToMany_1 = require("./OneToMany");
function OneToOne(entity, mappedByOrOptions, options = {}) {
    const mappedBy = typeof mappedByOrOptions === 'object' ? mappedByOrOptions.mappedBy : mappedByOrOptions;
    options = typeof mappedByOrOptions === 'object' ? { ...mappedByOrOptions, ...options } : options;
    return (0, OneToMany_1.createOneToDecorator)(entity, mappedBy, options, enums_1.ReferenceKind.ONE_TO_ONE);
}
