"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = transform;
const helpers_1 = require("./helpers");
const proxy_1 = require("./helpers/proxy");
const utils_1 = require("@medusajs/utils");
const ulid_1 = require("ulid");
function transform(values, ...functions) {
    const uniqId = (0, ulid_1.ulid)();
    const ret = {
        __id: uniqId,
        __type: utils_1.OrchestrationUtils.SymbolWorkflowStepTransformer,
    };
    const returnFn = async function (
    // If a transformer is returned as the result of a workflow, then at this point the workflow is entirely done, in that case we have a TransactionContext
    transactionContext) {
        if ("transaction" in transactionContext) {
            const temporaryDataKey = `${transactionContext.transaction.modelId}_${transactionContext.transaction.transactionId}_${uniqId}`;
            if (transactionContext.transaction.hasTemporaryData(temporaryDataKey)) {
                return transactionContext.transaction.getTemporaryData(temporaryDataKey);
            }
        }
        const stepValue = await (0, helpers_1.resolveValue)(values, transactionContext);
        let finalResult;
        for (let i = 0; i < functions.length; i++) {
            const fn = functions[i];
            const arg = i === 0 ? stepValue : finalResult;
            finalResult = await fn.apply(fn, [arg, transactionContext]);
        }
        if ("transaction" in transactionContext) {
            const temporaryDataKey = `${transactionContext.transaction.modelId}_${transactionContext.transaction.transactionId}_${uniqId}`;
            transactionContext.transaction.setTemporaryData(temporaryDataKey, finalResult);
        }
        return finalResult;
    };
    const proxyfiedRet = (0, proxy_1.proxify)(ret);
    proxyfiedRet.__resolver = returnFn;
    return proxyfiedRet;
}
//# sourceMappingURL=transform.js.map