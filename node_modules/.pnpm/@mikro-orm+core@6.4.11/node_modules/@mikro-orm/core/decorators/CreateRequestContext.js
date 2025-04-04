"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRequestContext = CreateRequestContext;
exports.EnsureRequestContext = EnsureRequestContext;
const RequestContext_1 = require("../utils/RequestContext");
const resolveContextProvider_1 = require("../utils/resolveContextProvider");
const TransactionContext_1 = require("../utils/TransactionContext");
function CreateRequestContext(context, respectExistingContext = false) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const em = await (0, resolveContextProvider_1.resolveContextProvider)(this, context);
            if (!em) {
                const name = respectExistingContext ? 'EnsureRequestContext' : 'CreateRequestContext';
                throw new Error(`@${name}() decorator can only be applied to methods of classes with \`orm: MikroORM\` property, \`em: EntityManager\` property, or with a callback parameter like \`@${name}(() => orm)\` that returns one of those types. The parameter will contain a reference to current \`this\`. Returning an EntityRepository from it is also supported.`);
            }
            // reuse existing context if available for given respect `contextName`
            if (respectExistingContext && RequestContext_1.RequestContext.getEntityManager(em.name)) {
                return originalMethod.apply(this, args);
            }
            // Otherwise, the outer tx context would be preferred.
            const txContext = TransactionContext_1.TransactionContext.currentTransactionContext();
            const provider = txContext ? TransactionContext_1.TransactionContext : RequestContext_1.RequestContext;
            return txContext
                ? provider.create(em.fork({ useContext: true }), () => originalMethod.apply(this, args))
                : provider.create(em, () => originalMethod.apply(this, args));
        };
        return descriptor;
    };
}
function EnsureRequestContext(context) {
    return CreateRequestContext(context, true);
}
