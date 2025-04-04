"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const region_1 = __importDefault(require("./region"));
exports.default = utils_1.model
    .define({ name: "Country", tableName: "region_country" }, {
    iso_2: utils_1.model.text().searchable().primaryKey(),
    iso_3: utils_1.model.text(),
    num_code: utils_1.model.text(),
    name: utils_1.model.text().searchable(),
    display_name: utils_1.model.text(),
    region: utils_1.model
        .belongsTo(() => region_1.default, { mappedBy: "countries" })
        .nullable(),
    metadata: utils_1.model.json().nullable(),
})
    .indexes([
    {
        // TODO: Remove ts-ignore when field inference takes into account the nullable property
        // @ts-ignore
        on: ["region_id", "iso_2"],
        unique: true,
    },
]);
//# sourceMappingURL=country.js.map