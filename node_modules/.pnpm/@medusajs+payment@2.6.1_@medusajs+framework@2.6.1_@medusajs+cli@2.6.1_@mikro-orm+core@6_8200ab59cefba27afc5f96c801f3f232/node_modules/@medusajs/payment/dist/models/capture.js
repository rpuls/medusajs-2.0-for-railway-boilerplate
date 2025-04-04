"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const payment_1 = __importDefault(require("./payment"));
const Capture = utils_1.model
    .define("Capture", {
    id: utils_1.model.id({ prefix: "capt" }).primaryKey(),
    amount: utils_1.model.bigNumber(),
    payment: utils_1.model.belongsTo(() => payment_1.default, {
        mappedBy: "captures",
    }),
    metadata: utils_1.model.json().nullable(),
    created_by: utils_1.model.text().nullable(),
})
    .indexes([
    {
        name: "IDX_capture_payment_id",
        on: ["payment_id"],
    },
]);
exports.default = Capture;
//# sourceMappingURL=capture.js.map