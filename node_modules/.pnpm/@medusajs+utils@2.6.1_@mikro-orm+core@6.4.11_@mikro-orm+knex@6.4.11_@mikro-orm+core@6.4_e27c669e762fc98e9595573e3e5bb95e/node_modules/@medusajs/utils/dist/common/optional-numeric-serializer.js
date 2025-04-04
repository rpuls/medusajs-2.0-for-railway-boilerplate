"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalNumericSerializer = void 0;
const is_defined_1 = require("./is-defined");
const optionalNumericSerializer = (value) => (0, is_defined_1.isDefined)(value) && value !== null ? Number(value) : value;
exports.optionalNumericSerializer = optionalNumericSerializer;
//# sourceMappingURL=optional-numeric-serializer.js.map