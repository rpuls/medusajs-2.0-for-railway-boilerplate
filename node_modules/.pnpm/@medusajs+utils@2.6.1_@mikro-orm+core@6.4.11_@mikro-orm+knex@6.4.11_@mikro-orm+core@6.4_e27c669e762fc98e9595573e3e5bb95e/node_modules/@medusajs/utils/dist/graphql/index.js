"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeTypeDefs = exports.makeExecutableSchema = void 0;
__exportStar(require("./graphql-parser"), exports);
__exportStar(require("./graphql-to-fields"), exports);
__exportStar(require("./extract-relations-from-graphql"), exports);
__exportStar(require("./clean-graphql"), exports);
__exportStar(require("./graphql-to-ts-types"), exports);
__exportStar(require("./get-fields-and-relations"), exports);
__exportStar(require("graphql"), exports);
__exportStar(require("graphql/type"), exports);
var schema_1 = require("@graphql-tools/schema");
Object.defineProperty(exports, "makeExecutableSchema", { enumerable: true, get: function () { return schema_1.makeExecutableSchema; } });
var merge_1 = require("@graphql-tools/merge");
Object.defineProperty(exports, "mergeTypeDefs", { enumerable: true, get: function () { return merge_1.mergeTypeDefs; } });
//# sourceMappingURL=index.js.map