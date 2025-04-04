"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeforeCreate = BeforeCreate;
exports.AfterCreate = AfterCreate;
exports.BeforeUpdate = BeforeUpdate;
exports.AfterUpdate = AfterUpdate;
exports.BeforeUpsert = BeforeUpsert;
exports.AfterUpsert = AfterUpsert;
exports.OnInit = OnInit;
exports.OnLoad = OnLoad;
exports.BeforeDelete = BeforeDelete;
exports.AfterDelete = AfterDelete;
const metadata_1 = require("../metadata");
const enums_1 = require("../enums");
function hook(type) {
    return function (target, method) {
        const meta = metadata_1.MetadataStorage.getMetadataFromDecorator(target.constructor);
        if (!meta.hooks[type]) {
            meta.hooks[type] = [];
        }
        meta.hooks[type].push(method);
    };
}
function BeforeCreate() {
    return hook(enums_1.EventType.beforeCreate);
}
function AfterCreate() {
    return hook(enums_1.EventType.afterCreate);
}
function BeforeUpdate() {
    return hook(enums_1.EventType.beforeUpdate);
}
function AfterUpdate() {
    return hook(enums_1.EventType.afterUpdate);
}
function BeforeUpsert() {
    return hook(enums_1.EventType.beforeUpsert);
}
function AfterUpsert() {
    return hook(enums_1.EventType.afterUpsert);
}
function OnInit() {
    return hook(enums_1.EventType.onInit);
}
function OnLoad() {
    return hook(enums_1.EventType.onLoad);
}
/**
 * Called before deleting entity, but only when providing initialized entity to EM#remove()
 */
function BeforeDelete() {
    return hook(enums_1.EventType.beforeDelete);
}
/**
 * Called after deleting entity, but only when providing initialized entity to EM#remove()
 */
function AfterDelete() {
    return hook(enums_1.EventType.afterDelete);
}
