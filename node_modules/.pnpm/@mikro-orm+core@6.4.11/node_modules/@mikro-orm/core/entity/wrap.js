"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrap = wrap;
exports.helper = helper;
/**
 * wraps entity type with WrappedEntity internal properties and helpers like init/isInitialized/populated/toJSON
 * use `preferHelper = true` to have access to the internal `__` properties like `__meta` or `__em`
 */
function wrap(entity, preferHelper = false) {
    if (!entity) {
        return entity;
    }
    if (entity.__baseEntity && !preferHelper) {
        return entity;
    }
    return entity.__helper ?? entity;
}
/**
 * wraps entity type with WrappedEntity internal properties and helpers like init/isInitialized/populated/toJSON
 * use `preferHelper = true` to have access to the internal `__` properties like `__meta` or `__em`
 * @internal
 */
function helper(entity) {
    return entity.__helper;
}
