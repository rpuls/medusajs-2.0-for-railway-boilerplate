import { AuthenticationInput, AuthenticationResponse, AuthIdentityProviderService, EmailPassAuthProviderOptions, Logger } from "@medusajs/framework/types";
import { AbstractAuthModuleProvider } from "@medusajs/framework/utils";
type InjectedDependencies = {
    logger: Logger;
};
interface LocalServiceConfig extends EmailPassAuthProviderOptions {
}
export declare class EmailPassAuthService extends AbstractAuthModuleProvider {
    static identifier: string;
    static DISPLAY_NAME: string;
    protected config_: LocalServiceConfig;
    protected logger_: Logger;
    constructor({ logger }: InjectedDependencies, options: EmailPassAuthProviderOptions);
    protected hashPassword(password: string): Promise<string>;
    update(data: {
        password: string;
        entity_id: string;
    }, authIdentityService: AuthIdentityProviderService): Promise<{
        success: boolean;
        error?: undefined;
        authIdentity?: undefined;
    } | {
        success: boolean;
        error: any;
        authIdentity?: undefined;
    } | {
        success: boolean;
        authIdentity: any;
        error?: undefined;
    }>;
    protected createAuthIdentity({ email, password, authIdentityService }: {
        email: any;
        password: any;
        authIdentityService: any;
    }): Promise<any>;
    authenticate(userData: AuthenticationInput, authIdentityService: AuthIdentityProviderService): Promise<AuthenticationResponse>;
    register(userData: AuthenticationInput, authIdentityService: AuthIdentityProviderService): Promise<AuthenticationResponse>;
}
export {};
//# sourceMappingURL=emailpass.d.ts.map