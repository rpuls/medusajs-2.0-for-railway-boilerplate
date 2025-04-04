"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvitesWorkflow = exports.createInvitesWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const steps_1 = require("../steps");
exports.createInvitesWorkflowId = "create-invite-step";
/**
 * This workflow creates one or more user invites. It's used by the
 * [Create Invite Admin API Route](https://docs.medusajs.com/api/admin#invites_postinvites).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create invites within your custom flows.
 *
 * @example
 * const { result } = await createInvitesWorkflow(container)
 * .run({
 *   input: {
 *     invites: [
 *       {
 *         email: "example@gmail.com"
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more user invites.
 */
exports.createInvitesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createInvitesWorkflowId, (input) => {
    const createdInvites = (0, steps_1.createInviteStep)(input.invites);
    const invitesIdEvents = (0, workflows_sdk_1.transform)({ createdInvites }, ({ createdInvites }) => {
        return createdInvites.map((v) => {
            return { id: v.id };
        });
    });
    (0, emit_event_1.emitEventStep)({
        eventName: utils_1.InviteWorkflowEvents.CREATED,
        data: invitesIdEvents,
    });
    return new workflows_sdk_1.WorkflowResponse(createdInvites);
});
//# sourceMappingURL=create-invites.js.map