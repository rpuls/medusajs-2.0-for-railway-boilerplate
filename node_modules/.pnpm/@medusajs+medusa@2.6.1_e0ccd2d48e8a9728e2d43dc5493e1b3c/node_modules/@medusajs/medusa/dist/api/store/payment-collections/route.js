"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const POST = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const { cart_id } = req.body;
    // We can potentially refactor the workflow to behave more like an upsert and return an existing collection if there is one.
    const [cartCollectionRelation] = await remoteQuery((0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "cart_payment_collection",
        variables: { filters: { cart_id } },
        fields: req.queryConfig.fields.map((f) => `payment_collection.${f}`),
    }));
    let paymentCollection = cartCollectionRelation?.payment_collection;
    if (!paymentCollection) {
        await (0, core_flows_1.createPaymentCollectionForCartWorkflow)(req.scope).run({
            input: req.body,
        });
        const [cartCollectionRelation] = await remoteQuery((0, utils_1.remoteQueryObjectFromString)({
            entryPoint: "cart_payment_collection",
            variables: { filters: { cart_id } },
            fields: req.queryConfig.fields.map((f) => `payment_collection.${f}`),
        }));
        paymentCollection = cartCollectionRelation?.payment_collection;
    }
    res.status(200).json({ payment_collection: paymentCollection });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map