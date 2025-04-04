"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailPassAuthService = void 0;
const utils_1 = require("@medusajs/framework/utils");
const scrypt_kdf_1 = __importDefault(require("scrypt-kdf"));
class EmailPassAuthService extends utils_1.AbstractAuthModuleProvider {
    constructor({ logger }, options) {
        // @ts-ignore
        super(...arguments);
        this.config_ = options;
        this.logger_ = logger;
    }
    async hashPassword(password) {
        const hashConfig = this.config_.hashConfig ?? { logN: 15, r: 8, p: 1 };
        const passwordHash = await scrypt_kdf_1.default.kdf(password, hashConfig);
        return passwordHash.toString("base64");
    }
    async update(data, authIdentityService) {
        const { password, entity_id } = data ?? {};
        if (!entity_id) {
            return {
                success: false,
                error: `Cannot update ${this.provider} provider identity without entity_id`,
            };
        }
        if (!password || !(0, utils_1.isString)(password)) {
            return { success: true };
        }
        let authIdentity;
        try {
            const passwordHash = await this.hashPassword(password);
            authIdentity = await authIdentityService.update(entity_id, {
                provider_metadata: {
                    password: passwordHash,
                },
            });
        }
        catch (error) {
            return { success: false, error: error.message };
        }
        return {
            success: true,
            authIdentity,
        };
    }
    async createAuthIdentity({ email, password, authIdentityService }) {
        const passwordHash = await this.hashPassword(password);
        const createdAuthIdentity = await authIdentityService.create({
            entity_id: email,
            provider_metadata: {
                password: passwordHash,
            },
        });
        const copy = JSON.parse(JSON.stringify(createdAuthIdentity));
        const providerIdentity = copy.provider_identities?.find((pi) => pi.provider === this.provider);
        delete providerIdentity.provider_metadata?.password;
        return copy;
    }
    async authenticate(userData, authIdentityService) {
        const { email, password } = userData.body ?? {};
        if (!password || !(0, utils_1.isString)(password)) {
            return {
                success: false,
                error: "Password should be a string",
            };
        }
        if (!email || !(0, utils_1.isString)(email)) {
            return {
                success: false,
                error: "Email should be a string",
            };
        }
        let authIdentity;
        try {
            authIdentity = await authIdentityService.retrieve({
                entity_id: email,
            });
        }
        catch (error) {
            if (error.type === utils_1.MedusaError.Types.NOT_FOUND) {
                return {
                    success: false,
                    error: "Invalid email or password",
                };
            }
            return { success: false, error: error.message };
        }
        const providerIdentity = authIdentity.provider_identities?.find((pi) => pi.provider === this.provider);
        const passwordHash = providerIdentity.provider_metadata?.password;
        if ((0, utils_1.isString)(passwordHash)) {
            const buf = Buffer.from(passwordHash, "base64");
            const success = await scrypt_kdf_1.default.verify(buf, password);
            if (success) {
                const copy = JSON.parse(JSON.stringify(authIdentity));
                const providerIdentity = copy.provider_identities?.find((pi) => pi.provider === this.provider);
                delete providerIdentity.provider_metadata?.password;
                return {
                    success,
                    authIdentity: copy,
                };
            }
        }
        return {
            success: false,
            error: "Invalid email or password",
        };
    }
    async register(userData, authIdentityService) {
        const { email, password } = userData.body ?? {};
        if (!password || !(0, utils_1.isString)(password)) {
            return {
                success: false,
                error: "Password should be a string",
            };
        }
        if (!email || !(0, utils_1.isString)(email)) {
            return {
                success: false,
                error: "Email should be a string",
            };
        }
        try {
            await authIdentityService.retrieve({
                entity_id: email,
            });
            return {
                success: false,
                error: "Identity with email already exists",
            };
        }
        catch (error) {
            if (error.type === utils_1.MedusaError.Types.NOT_FOUND) {
                const createdAuthIdentity = await this.createAuthIdentity({
                    email,
                    password,
                    authIdentityService,
                });
                return {
                    success: true,
                    authIdentity: createdAuthIdentity,
                };
            }
            return { success: false, error: error.message };
        }
    }
}
exports.EmailPassAuthService = EmailPassAuthService;
EmailPassAuthService.identifier = "emailpass";
EmailPassAuthService.DISPLAY_NAME = "Email/Password Authentication";
//# sourceMappingURL=emailpass.js.map