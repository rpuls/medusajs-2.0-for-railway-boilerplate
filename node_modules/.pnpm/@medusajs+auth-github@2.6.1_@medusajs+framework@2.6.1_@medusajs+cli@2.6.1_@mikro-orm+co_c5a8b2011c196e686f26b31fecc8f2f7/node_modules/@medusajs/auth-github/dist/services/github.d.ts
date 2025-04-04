import { AuthenticationInput, AuthenticationResponse, AuthIdentityProviderService, GithubAuthProviderOptions, Logger } from "@medusajs/framework/types";
import { AbstractAuthModuleProvider } from "@medusajs/framework/utils";
type InjectedDependencies = {
    logger: Logger;
};
interface LocalServiceConfig extends GithubAuthProviderOptions {
}
export declare class GithubAuthService extends AbstractAuthModuleProvider {
    static identifier: string;
    static DISPLAY_NAME: string;
    protected config_: LocalServiceConfig;
    protected logger_: Logger;
    static validateOptions(options: GithubAuthProviderOptions): void;
    constructor({ logger }: InjectedDependencies, options: GithubAuthProviderOptions);
    register(_: any): Promise<AuthenticationResponse>;
    authenticate(req: AuthenticationInput, authIdentityService: AuthIdentityProviderService): Promise<AuthenticationResponse>;
    validateCallback(req: AuthenticationInput, authIdentityService: AuthIdentityProviderService): Promise<AuthenticationResponse>;
    upsert_(providerMetadata: {
        access_token: string;
        refresh_token: string;
        access_token_expires_at: string;
        refresh_token_expires_at: string;
    }, authIdentityService: AuthIdentityProviderService): Promise<{
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
//# sourceMappingURL=github.d.ts.map