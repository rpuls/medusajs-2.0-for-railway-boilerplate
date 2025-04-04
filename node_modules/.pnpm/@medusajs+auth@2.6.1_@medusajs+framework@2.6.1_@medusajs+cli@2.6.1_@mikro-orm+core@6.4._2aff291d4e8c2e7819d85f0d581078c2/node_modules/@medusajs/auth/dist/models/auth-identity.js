"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthIdentity = void 0;
const utils_1 = require("@medusajs/framework/utils");
const provider_identity_1 = require("./provider-identity");
exports.AuthIdentity = utils_1.model
    .define("auth_identity", {
    id: utils_1.model.id({ prefix: "authid" }).primaryKey(),
    provider_identities: utils_1.model.hasMany(() => provider_identity_1.ProviderIdentity, {
        mappedBy: "auth_identity",
    }),
    app_metadata: utils_1.model.json().nullable(),
})
    .cascades({
    delete: ["provider_identities"],
});
//# sourceMappingURL=auth-identity.js.map