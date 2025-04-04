"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnRepository = void 0;
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("../models");
const base_repository_find_1 = require("../utils/base-repository-find");
class ReturnRepository extends utils_1.DALUtils.mikroOrmBaseRepositoryFactory(_models_1.Return) {
}
exports.ReturnRepository = ReturnRepository;
(0, base_repository_find_1.setFindMethods)(ReturnRepository, _models_1.Return);
//# sourceMappingURL=return.js.map