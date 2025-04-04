"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEntitiesStep = exports.deleteEntitiesStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteEntitiesStepId = "delete-entities-step";
/**
 * This step deletes one or more entities.
 */
exports.deleteEntitiesStep = (0, workflows_sdk_1.createStep)(exports.deleteEntitiesStepId, async (input, { container }) => {
    const { moduleRegistrationName, invokeMethod, compensateMethod, data = [], } = input;
    const module = container.resolve(moduleRegistrationName);
    data.length ? await module[invokeMethod](data) : [];
    return new workflows_sdk_1.StepResponse(void 0, {
        entityIdentifiers: input.data,
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
//# sourceMappingURL=delete-entities.js.map