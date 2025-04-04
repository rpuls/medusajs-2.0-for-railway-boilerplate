"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseEventsStep = exports.releaseEventsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.releaseEventsStepId = "release-events-step";
exports.releaseEventsStep = (0, workflows_sdk_1.createStep)(exports.releaseEventsStepId, async (input, { container, eventGroupId }) => {
    const eventBusService = container.resolve(utils_1.Modules.EVENT_BUS, {
        allowUnregistered: true,
    });
    if (!eventBusService || !eventGroupId) {
        return;
    }
    await eventBusService.releaseGroupedEvents(eventGroupId);
}, async (data) => { });
//# sourceMappingURL=release-event.js.map