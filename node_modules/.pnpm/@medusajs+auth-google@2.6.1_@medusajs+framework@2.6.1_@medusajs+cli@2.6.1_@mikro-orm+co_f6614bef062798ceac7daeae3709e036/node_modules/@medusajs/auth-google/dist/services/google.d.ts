import { AuthenticationInput, AuthenticationResponse, AuthIdentityProviderService, GoogleAuthProviderOptions, Logger } from "@medusajs/framework/types";
import { AbstractAuthModuleProvider } from "@medusajs/framework/utils";
type InjectedDependencies = {
    logger: Logger;
};
interface LocalServiceConfig extends GoogleAuthProviderOptions {
}
export declare class GoogleAuthService extends AbstractAuthModuleProvider {
    static identifier: string;
    static DISPLAY_NAME: string;
    protected config_: LocalServiceConfig;
    protected logger_: Logger;
    static validateOptions(options: GoogleAuthProviderOptions): void;
    constructor({ logger }: InjectedDependencies, options: GoogleAuthProviderOptions);
    register(_: any): Promise<AuthenticationResponse>;
    authenticate(req: AuthenticationInput, authIdentityService: AuthIdentityProviderService): Promise<AuthenticationResponse>;
    validateCallback(req: AuthenticationInput, authIdentityService: AuthIdentityProviderService): Promise<AuthenticationResponse>;
    verify_(idToken: string | undefined, authIdentityService: AuthIdentityProviderService): Promise<{
        success: boolean;
        error: any;
        authIdentity?: undefined;
    } | {
        success: boolean;
        authIdentity: any;
        error?: undefined;
    }>;
    private getRedirect;
}
export {};
//# sourceMappingURL=google.d.ts.map