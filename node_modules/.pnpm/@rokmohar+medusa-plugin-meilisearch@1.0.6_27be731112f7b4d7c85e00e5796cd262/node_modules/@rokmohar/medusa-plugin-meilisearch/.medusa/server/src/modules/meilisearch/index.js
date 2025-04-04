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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/utils");
const loaders_1 = __importDefault(require("./loaders"));
const services_1 = require("./services");
__exportStar(require("./services"), exports);
__exportStar(require("./types"), exports);
exports.default = (0, utils_1.Module)('meilisearch', {
    service: services_1.MeiliSearchService,
    loaders: [loaders_1.default],
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9tZWlsaXNlYXJjaC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQXdDO0FBQ3hDLHdEQUE4QjtBQUM5Qix5Q0FBK0M7QUFFL0MsNkNBQTBCO0FBQzFCLDBDQUF1QjtBQUV2QixrQkFBZSxJQUFBLGNBQU0sRUFBQyxhQUFhLEVBQUU7SUFDbkMsT0FBTyxFQUFFLDZCQUFrQjtJQUMzQixPQUFPLEVBQUUsQ0FBQyxpQkFBTSxDQUFDO0NBQ2xCLENBQUMsQ0FBQSJ9