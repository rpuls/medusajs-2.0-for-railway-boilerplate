"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchReservation = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchReservation = async (reservationId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "reservation",
        variables: {
            filters: { id: reservationId },
        },
        fields: fields,
    });
    const reservations = await remoteQuery(queryObject);
    return reservations[0];
};
exports.refetchReservation = refetchReservation;
//# sourceMappingURL=helpers.js.map