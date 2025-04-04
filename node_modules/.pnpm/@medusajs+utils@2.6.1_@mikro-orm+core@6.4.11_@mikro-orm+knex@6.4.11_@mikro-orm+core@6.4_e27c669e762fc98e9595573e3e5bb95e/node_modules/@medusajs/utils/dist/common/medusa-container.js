"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMedusaContainer = createMedusaContainer;
const awilix_1 = require("awilix");
function asArray(resolvers) {
    return {
        resolve: (container) => resolvers.map((resolver) => container.build(resolver)),
    };
}
function registerAdd(name, registration) {
    const storeKey = name + "_STORE";
    if (this.registrations[storeKey] === undefined) {
        this.register(storeKey, (0, awilix_1.asValue)([]));
    }
    const store = this.resolve(storeKey);
    if (this.registrations[name] === undefined) {
        this.register(name, asArray(store));
    }
    store.unshift(registration);
    return this;
}
function createMedusaContainer(...args) {
    const container = awilix_1.createContainer.apply(null, args);
    container.registerAdd = registerAdd.bind(container);
    const originalScope = container.createScope;
    container.createScope = () => {
        const scoped = originalScope();
        scoped.registerAdd = registerAdd.bind(scoped);
        return scoped;
    };
    return container;
}
//# sourceMappingURL=medusa-container.js.map