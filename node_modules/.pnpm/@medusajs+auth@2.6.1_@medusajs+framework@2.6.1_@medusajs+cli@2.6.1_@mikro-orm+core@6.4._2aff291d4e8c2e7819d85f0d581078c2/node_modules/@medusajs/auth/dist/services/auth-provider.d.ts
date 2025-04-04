import { AuthenticationInput, AuthenticationResponse, AuthIdentityProviderService, AuthTypes, Logger } from "@medusajs/framework/types";
import { AuthProviderRegistrationPrefix } from "../types";
type InjectedDependencies = {
    [key: `${typeof AuthProviderRegistrationPrefix}${string}`]: AuthTypes.IAuthProvider;
    logger?: Logger;
};
export default class AuthProviderService {
    #private;
    protected dependencies: InjectedDependencies;
    constructor(container: InjectedDependencies);
    protected retrieveProviderRegistration(providerId: string): AuthTypes.IAuthProvider;
    authenticate(provider: string, auth: AuthenticationInput, authIdentityProviderService: AuthIdentityProviderService): Promise<AuthenticationResponse>;
    register(provider: string, auth: AuthenticationInput, authIdentityProviderService: AuthIdentityProviderService): Promise<AuthenticationResponse>;
    update(provider: string, data: Record<string, unknown>, authIdentityProviderService: AuthIdentityProviderService): Promise<AuthenticationResponse>;
    validateCallback(provider: string, auth: AuthenticationInput, authIdentityProviderService: AuthIdentityProviderService): Promise<AuthenticationResponse>;
}
export {};
//# sourceMappingURL=auth-provider.d.ts.map