"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transactional = Transactional;
const RequestContext_1 = require("../utils/RequestContext");
const resolveContextProvider_1 = require("../utils/resolveContextProvider");
const TransactionContext_1 = require("../utils/TransactionContext");
/**
 * This decorator wraps the method with `em.transactional()`, so you can provide `TransactionOptions` just like with `em.transactional()`.
 * The difference is that you can specify the context in which the transaction begins by providing `context` option,
 * and if omitted, the transaction will begin in the current context implicitly.
 * It works on async functions and can be nested with `em.transactional()`.
 */
function Transactional(options = {}) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        if (originalMethod.constructor.name !== 'AsyncFunction') {
            throw new Error('@Transactional() should be use with async functions');
        }
        descriptor.value = async function (...args) {
            const { context, ...txOptions } = options;
            const em = await (0, resolveContextProvider_1.resolveContextProvider)(this, context)
                || TransactionContext_1.TransactionContext.getEntityManager()
                || RequestContext_1.RequestContext.getEntityManager();
            if (!em) {
                throw new Error(`@Transactional() decorator can only be applied to methods of classes with \`orm: MikroORM\` property, \`em: EntityManager\` property, or with a callback parameter like \`@Transactional(() => orm)\` that returns one of those types. The parameter will contain a reference to current \`this\`. Returning an EntityRepository from it is also supported.`);
            }
            return em.transactional(() => originalMethod.apply(this, args), txOptions);
        };
        return descriptor;
    };
}
