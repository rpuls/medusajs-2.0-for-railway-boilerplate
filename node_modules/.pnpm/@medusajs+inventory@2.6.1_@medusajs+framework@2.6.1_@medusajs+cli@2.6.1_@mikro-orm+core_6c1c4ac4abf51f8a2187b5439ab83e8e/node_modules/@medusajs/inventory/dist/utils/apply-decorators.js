"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyEntityHooks = void 0;
const utils_1 = require("@medusajs/framework/utils");
const core_1 = require("@mikro-orm/core");
const inventory_item_1 = __importDefault(require("../models/inventory-item"));
const inventory_level_1 = __importDefault(require("../models/inventory-level"));
function applyHook() {
    const MikroORMEntity = (0, utils_1.toMikroORMEntity)(inventory_level_1.default);
    MikroORMEntity.prototype["onInit"] = function () {
        if ((0, utils_1.isDefined)(this.stocked_quantity) && (0, utils_1.isDefined)(this.reserved_quantity)) {
            this.available_quantity = new utils_1.BigNumber(utils_1.MathBN.sub(this.raw_stocked_quantity, this.raw_reserved_quantity));
        }
    };
    (0, core_1.OnInit)()(MikroORMEntity.prototype, "onInit");
}
function applyFormulas() {
    const MikroORMEntity = (0, utils_1.toMikroORMEntity)(inventory_item_1.default);
    (0, core_1.Formula)((item) => `(SELECT SUM(reserved_quantity) FROM inventory_level il WHERE il.inventory_item_id = ${item}.id AND il.deleted_at IS NULL)`, { lazy: true, serializer: Number, hidden: true, type: "number" })(MikroORMEntity.prototype, "reserved_quantity");
    (0, core_1.Formula)((item) => `(SELECT SUM(stocked_quantity) FROM inventory_level il WHERE il.inventory_item_id = ${item}.id AND il.deleted_at IS NULL)`, { lazy: true, serializer: Number, hidden: true, type: "number" })(MikroORMEntity.prototype, "stocked_quantity");
}
const applyEntityHooks = () => {
    applyHook();
    applyFormulas();
};
exports.applyEntityHooks = applyEntityHooks;
//# sourceMappingURL=apply-decorators.js.map