"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEntitiesStep = exports.createEntitiesStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createEntitiesStepId = "create-entities-step";
/**
 * This step creates entities for any given module or resource
 */
exports.createEntitiesStep = (0, workflows_sdk_1.createStep)(exports.createEntitiesStepId, async (input, { container }) => {
    const { moduleRegistrationName, invokeMethod, compensateMethod, entityIdentifier = "id", data = [], } = input;
    const module = container.resolve(moduleRegistrationName);
    const created = data.length ? await module[invokeMethod](data) : [];
    return new workflows_sdk_1.StepResponse(created, {
        entityIdentifiers: created.map((c) => c[entityIdentifier]),
        moduleRegistrationName,
        compensateMethod,
    });
}, async (compensateInput, { container }) => {
    const { entityIdentifiers = [], moduleRegistrationName, compensateMethod, } = compensateInput;
    if (!entityIdentifiers?.length) {
        return;
    }
    const module = container.resolve(moduleRegistrationName);
    await module[compensateMethod](entityIdentifiers);
});
//# sourceMappingURL=create-entities.js.map