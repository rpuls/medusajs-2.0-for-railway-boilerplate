"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const [service_zone] = await remoteQuery((0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "service_zones",
        variables: {
            id: req.params.zone_id,
        },
        fields: req.queryConfig.fields,
    }));
    if (!service_zone) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Service zone with id: ${req.params.zone_id} not found`);
    }
    res.status(200).json({ service_zone });
};
exports.GET = GET;
const POST = async (req, res) => {
    const fulfillmentModuleService = req.scope.resolve(utils_1.Modules.FULFILLMENT);
    // ensure fulfillment set exists and that the service zone is part of it
    const fulfillmentSet = await fulfillmentModuleService.retrieveFulfillmentSet(req.params.id, { relations: ["service_zones"] });
    if (!fulfillmentSet.service_zones.find((s) => s.id === req.params.zone_id)) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Service zone with id: ${req.params.zone_id} not found on fulfillment set`);
    }
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const workflowInput = {
        selector: { id: req.params.zone_id },
        update: req.validatedBody,
    };
    await (0, core_flows_1.updateServiceZonesWorkflow)(req.scope).run({
        input: workflowInput,
    });
    const [fulfillment_set] = await remoteQuery((0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "fulfillment_sets",
        variables: {
            id: req.params.id,
        },
        fields: req.queryConfig.fields,
    }));
    res.status(200).json({ fulfillment_set });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const { id, zone_id } = req.params;
    const fulfillmentModuleService = req.scope.resolve(utils_1.Modules.FULFILLMENT);
    // ensure fulfillment set exists and that the service zone is part of it
    const fulfillmentSet = await fulfillmentModuleService.retrieveFulfillmentSet(id, {
        relations: ["service_zones"],
    });
    if (!fulfillmentSet.service_zones.find((s) => s.id === zone_id)) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Service zone with id: ${zone_id} not found on fulfillment set`);
    }
    await (0, core_flows_1.deleteServiceZonesWorkflow)(req.scope).run({
        input: { ids: [zone_id] },
    });
    res.status(200).json({
        id: zone_id,
        object: "service_zone",
        deleted: true,
        parent: fulfillmentSet,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map