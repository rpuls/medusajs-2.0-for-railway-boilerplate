"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseAll = promiseAll;
const os_1 = require("os");
const getMessageError = (state) => state.reason.message ?? state.reason;
const isRejected = (state) => {
    return state.status === "rejected";
};
const getValue = (state) => state.value;
/**
 * Promise.allSettled with error handling, safe alternative to Promise.all
 * @param promises
 * @param aggregateErrors
 */
async function promiseAll(promises, { aggregateErrors } = { aggregateErrors: false }) {
    if (!promises.length) {
        return [];
    }
    const states = await Promise.allSettled(promises);
    const rejected = states.filter(isRejected);
    if (rejected.length) {
        if (aggregateErrors) {
            throw new Error(rejected.map(getMessageError).join(os_1.EOL));
        }
        throw rejected[0].reason; // Re throw the error itself
    }
    return states.map(getValue);
}
//# sourceMappingURL=promise-all.js.map