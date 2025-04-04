"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../helpers");
const GET = async (req, res) => {
    const { id } = req.params;
    const reservation = await (0, helpers_1.refetchReservation)(id, req.scope, req.queryConfig.fields);
    if (!reservation) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Reservation with id: ${id} was not found`);
    }
    res.status(200).json({ reservation });
};
exports.GET = GET;
const POST = async (req, res) => {
    const { id } = req.params;
    await (0, core_flows_1.updateReservationsWorkflow)(req.scope).run({
        input: {
            updates: [{ ...req.validatedBody, id }],
        },
    });
    const reservation = await (0, helpers_1.refetchReservation)(id, req.scope, req.queryConfig.fields);
    res.status(200).json({ reservation });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.params.id;
    await (0, core_flows_1.deleteReservationsWorkflow)(req.scope).run({
        input: { ids: [id] },
    });
    res.status(200).json({
        id,
        object: "reservation",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map