"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.when = when;
const utils_1 = require("@medusajs/utils");
const ulid_1 = require("ulid");
const create_step_1 = require("./create-step");
const step_response_1 = require("./helpers/step-response");
/**
 * @internal
 */
function when(...args) {
    let [name, input, condition] = args;
    if (args.length === 2) {
        condition = input;
        input = name;
        name = undefined;
    }
    if (typeof condition !== "function") {
        throw new Error(`"when condition" must be a function`);
    }
    global[utils_1.OrchestrationUtils.SymbolMedusaWorkflowComposerCondition] = {
        input,
        condition,
        steps: [],
    };
    let thenCalled = false;
    process.nextTick(() => {
        if (!thenCalled) {
            throw new Error(`".then" is missing after "when" condition`);
        }
    });
    return {
        then: (fn) => {
            thenCalled = true;
            const ret = fn();
            let returnStep = ret;
            const applyCondition = global[utils_1.OrchestrationUtils.SymbolMedusaWorkflowComposerCondition].steps;
            if ((0, utils_1.isDefined)(ret) &&
                ret?.__type !== utils_1.OrchestrationUtils.SymbolWorkflowStep) {
                if (!(0, utils_1.isDefined)(name)) {
                    name = "when-then-" + (0, ulid_1.ulid)();
                    const context = global[utils_1.OrchestrationUtils.SymbolMedusaWorkflowComposerContext];
                    console.warn(`${context.workflowId}: "when" name should be defined. A random one will be assigned to it, which is not recommended for production.\n`, condition.toString());
                }
                const retStep = (0, create_step_1.createStep)(name, ({ input }) => new step_response_1.StepResponse(input));
                returnStep = retStep({ input: ret });
            }
            for (const step of applyCondition) {
                step.if(input, condition);
            }
            delete global[utils_1.OrchestrationUtils.SymbolMedusaWorkflowComposerCondition];
            return returnStep;
        },
    };
}
//# sourceMappingURL=when.js.map