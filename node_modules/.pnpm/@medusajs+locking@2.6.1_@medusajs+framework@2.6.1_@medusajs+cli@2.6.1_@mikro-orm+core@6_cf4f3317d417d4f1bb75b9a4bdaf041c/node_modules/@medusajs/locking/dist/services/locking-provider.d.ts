import { Constructor, ILockingProvider, Logger } from "@medusajs/framework/types";
type InjectedDependencies = {
    [key: `lp_${string}`]: ILockingProvider;
    logger?: Logger;
};
export default class LockingProviderService {
    #private;
    protected __container__: InjectedDependencies;
    constructor(container: InjectedDependencies);
    static getRegistrationIdentifier(providerClass: Constructor<ILockingProvider>): string;
    retrieveProviderRegistration(providerId: string): ILockingProvider;
}
export {};
//# sourceMappingURL=locking-provider.d.ts.map