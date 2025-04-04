"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderClaimRepository = void 0;
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("../models");
const base_repository_find_1 = require("../utils/base-repository-find");
class OrderClaimRepository extends utils_1.DALUtils.mikroOrmBaseRepositoryFactory(_models_1.OrderClaim) {
}
exports.OrderClaimRepository = OrderClaimRepository;
(0, base_repository_find_1.setFindMethods)(OrderClaimRepository, _models_1.OrderClaim);
//# sourceMappingURL=claim.js.map