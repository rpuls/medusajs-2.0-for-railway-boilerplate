"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../helpers");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const variables = { id: req.params.id };
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "store",
        variables,
        fields: req.queryConfig.fields,
    });
    const [store] = await remoteQuery(queryObject);
    res.status(200).json({ store });
};
exports.GET = GET;
const POST = async (req, res) => {
    const existingStore = await (0, helpers_1.refetchStore)(req.params.id, req.scope, ["id"]);
    if (!existingStore) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Store with id "${req.params.id}" not found`);
    }
    const { result } = await (0, core_flows_1.updateStoresWorkflow)(req.scope).run({
        input: {
            selector: { id: req.params.id },
            update: req.validatedBody,
        },
    });
    const store = await (0, helpers_1.refetchStore)(result[0].id, req.scope, req.queryConfig.fields);
    res.status(200).json({ store });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map