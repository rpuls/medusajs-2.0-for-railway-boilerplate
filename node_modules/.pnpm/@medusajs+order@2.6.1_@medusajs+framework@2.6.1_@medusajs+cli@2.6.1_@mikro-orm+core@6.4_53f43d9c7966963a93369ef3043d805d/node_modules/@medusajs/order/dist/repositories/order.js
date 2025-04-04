"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRepository = void 0;
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("../models");
const base_repository_find_1 = require("../utils/base-repository-find");
class OrderRepository extends utils_1.DALUtils.mikroOrmBaseRepositoryFactory(_models_1.Order) {
}
exports.OrderRepository = OrderRepository;
(0, base_repository_find_1.setFindMethods)(OrderRepository, _models_1.Order);
//# sourceMappingURL=order.js.map