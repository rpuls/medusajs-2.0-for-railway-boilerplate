"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchPayment = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchPayment = async (paymentId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "payment",
        variables: {
            filters: { id: paymentId },
        },
        fields: fields,
    });
    const payments = await remoteQuery(queryObject);
    return payments[0];
};
exports.refetchPayment = refetchPayment;
//# sourceMappingURL=helpers.js.map