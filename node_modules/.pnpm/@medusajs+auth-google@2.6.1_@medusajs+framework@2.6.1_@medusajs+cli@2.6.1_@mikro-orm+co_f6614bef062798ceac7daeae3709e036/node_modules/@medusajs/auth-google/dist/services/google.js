"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuthService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const utils_1 = require("@medusajs/framework/utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class GoogleAuthService extends utils_1.AbstractAuthModuleProvider {
    static validateOptions(options) {
        if (!options.clientId) {
            throw new Error("Google clientId is required");
        }
        if (!options.clientSecret) {
            throw new Error("Google clientSecret is required");
        }
        if (!options.callbackUrl) {
            throw new Error("Google callbackUrl is required");
        }
    }
    constructor({ logger }, options) {
        // @ts-ignore
        super(...arguments);
        this.config_ = options;
        this.logger_ = logger;
    }
    async register(_) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Google does not support registration. Use method `authenticate` instead.");
    }
    async authenticate(req, authIdentityService) {
        const query = req.query ?? {};
        const body = req.body ?? {};
        if (query.error) {
            return {
                success: false,
                error: `${query.error_description}, read more at: ${query.error_uri}`,
            };
        }
        const stateKey = crypto_1.default.randomBytes(32).toString("hex");
        const state = {
            callback_url: body?.callback_url ?? this.config_.callbackUrl,
        };
        await authIdentityService.setState(stateKey, state);
        return this.getRedirect(this.config_.clientId, state.callback_url, stateKey);
    }
    async validateCallback(req, authIdentityService) {
        const query = req.query ?? {};
        const body = req.body ?? {};
        if (query.error) {
            return {
                success: false,
                error: `${query.error_description}, read more at: ${query.error_uri}`,
            };
        }
        const code = query?.code ?? body?.code;
        if (!code) {
            return { success: false, error: "No code provided" };
        }
        const state = await authIdentityService.getState(query?.state);
        if (!state) {
            return { success: false, error: "No state provided, or session expired" };
        }
        const params = `client_id=${this.config_.clientId}&client_secret=${this.config_.clientSecret}&code=${code}&redirect_uri=${state.callback_url}&grant_type=authorization_code`;
        const exchangeTokenUrl = new URL(`https://oauth2.googleapis.com/token?${params}`);
        try {
            const response = await fetch(exchangeTokenUrl.toString(), {
                method: "POST",
            }).then((r) => {
                if (!r.ok) {
                    throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Could not exchange token, ${r.status}, ${r.statusText}`);
                }
                return r.json();
            });
            const { authIdentity, success } = await this.verify_(response.id_token, authIdentityService);
            return {
                success,
                authIdentity,
            };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async verify_(idToken, authIdentityService) {
        if (!idToken) {
            return { success: false, error: "No ID found" };
        }
        const jwtData = jsonwebtoken_1.default.decode(idToken, {
            complete: true,
        });
        const payload = jwtData.payload;
        if (!payload.email_verified) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Email not verified, cannot proceed with authentication");
        }
        const entity_id = payload.sub;
        const userMetadata = {
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            given_name: payload.given_name,
            family_name: payload.family_name,
        };
        let authIdentity;
        try {
            authIdentity = await authIdentityService.retrieve({
                entity_id,
            });
        }
        catch (error) {
            if (error.type === utils_1.MedusaError.Types.NOT_FOUND) {
                const createdAuthIdentity = await authIdentityService.create({
                    entity_id,
                    user_metadata: userMetadata,
                });
                authIdentity = createdAuthIdentity;
            }
            else {
                return { success: false, error: error.message };
            }
        }
        return {
            success: true,
            authIdentity,
        };
    }
    getRedirect(clientId, callbackUrl, stateKey) {
        const authUrl = new URL(`https://accounts.google.com/o/oauth2/v2/auth`);
        authUrl.searchParams.set("redirect_uri", callbackUrl);
        authUrl.searchParams.set("client_id", clientId);
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("scope", "email profile openid");
        authUrl.searchParams.set("state", stateKey);
        return { success: true, location: authUrl.toString() };
    }
}
exports.GoogleAuthService = GoogleAuthService;
GoogleAuthService.identifier = "google";
GoogleAuthService.DISPLAY_NAME = "Google Authentication";
//# sourceMappingURL=google.js.map