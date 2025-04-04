"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLinkRepository = getLinkRepository;
const utils_1 = require("@medusajs/framework/utils");
function getLinkRepository(model) {
    return class LinkRepository extends (0, utils_1.mikroOrmBaseRepositoryFactory)(model) {
        constructor({ joinerConfig }) {
            // @ts-ignore
            super(...arguments);
            this.joinerConfig_ = joinerConfig;
        }
        async delete(data, context = {}) {
            const filter = {};
            for (const key in data) {
                filter[key] = {
                    $in: Array.isArray(data[key]) ? data[key] : [data[key]],
                };
            }
            return await super.delete(filter, context);
        }
        async create(data, context = {}) {
            const manager = this.getActiveManager(context);
            const links = data.map((link) => {
                link.id = (0, utils_1.generateEntityId)(link.id, this.joinerConfig_.databaseConfig?.idPrefix ?? "link");
                link.deleted_at = null;
                return manager.create(model, link);
            });
            await manager.upsertMany(model, links);
            return links;
        }
    };
}
//# sourceMappingURL=link.js.map