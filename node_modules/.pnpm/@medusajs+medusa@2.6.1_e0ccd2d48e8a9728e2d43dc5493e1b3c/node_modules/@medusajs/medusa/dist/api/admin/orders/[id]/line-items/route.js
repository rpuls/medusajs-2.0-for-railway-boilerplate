"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const { id } = req.params;
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const result = await query.graph({
        entity: "order_items",
        filters: {
            ...req.filterableFields,
            order_id: id,
        },
        fields: (0, utils_1.deduplicate)(req.queryConfig.fields.concat(["item_id", "version"])),
    });
    const data = result.data;
    const deduplicatedItems = {};
    for (const item of data) {
        const itemId = item.item_id;
        const version = item.version;
        if (!deduplicatedItems[itemId]) {
            deduplicatedItems[itemId] = {
                ...item,
                history: {
                    version: {
                        from: version,
                        to: version,
                    },
                },
            };
            continue;
        }
        deduplicatedItems[itemId].history.version.to = Math.max(version, deduplicatedItems[itemId].history.version.to);
        deduplicatedItems[itemId].history.version.from = Math.min(version, deduplicatedItems[itemId].history.version.from);
        if (version > deduplicatedItems[itemId].version) {
            deduplicatedItems[itemId] = {
                ...item,
                history: deduplicatedItems[itemId].history,
            };
        }
    }
    res.json({
        order_items: Object.values(deduplicatedItems),
    });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map