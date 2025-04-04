"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setFindMethods = setFindMethods;
const utils_1 = require("@medusajs/framework/utils");
const core_1 = require("@mikro-orm/core");
const _models_1 = require("../models");
const _1 = require(".");
function setFindMethods(klass, entity) {
    klass.prototype.find = async function find(options, context) {
        const manager = this.getActiveManager(context);
        const knex = manager.getKnex();
        const findOptions_ = { ...options };
        findOptions_.options ??= {};
        findOptions_.where ??= {};
        if (!("strategy" in findOptions_.options)) {
            if (findOptions_.options.limit != null || findOptions_.options.offset) {
                Object.assign(findOptions_.options, {
                    strategy: core_1.LoadStrategy.SELECT_IN,
                });
            }
            else {
                Object.assign(findOptions_.options, {
                    strategy: core_1.LoadStrategy.JOINED,
                });
            }
        }
        const isRelatedEntity = entity.name !== _models_1.Order.name;
        const config = (0, _1.mapRepositoryToOrderModel)(findOptions_, isRelatedEntity);
        config.options ??= {};
        config.options.populate ??= [];
        const strategy = findOptions_.options.strategy ?? core_1.LoadStrategy.JOINED;
        let orderAlias = "o0";
        if (isRelatedEntity) {
            if (entity === _models_1.OrderClaim) {
                config.options.populate.push("claim_items");
            }
            if (strategy === core_1.LoadStrategy.JOINED) {
                config.options.populate.push("order.shipping_methods");
                config.options.populate.push("order.summary");
                config.options.populate.push("shipping_methods");
            }
            if (!config.options.populate.includes("order.items")) {
                config.options.populate.unshift("order.items");
            }
            // first relation is always order if the entity is not Order
            const index = config.options.populate.findIndex((p) => p === "order");
            if (index > -1) {
                config.options.populate.splice(index, 1);
            }
            config.options.populate.unshift("order");
            orderAlias = "o1";
        }
        let defaultVersion = knex.raw(`"${orderAlias}"."version"`);
        if (strategy === core_1.LoadStrategy.SELECT_IN) {
            const sql = manager
                .qb((0, utils_1.toMikroORMEntity)(_models_1.Order), "_sub0")
                .select("version")
                .where({ id: knex.raw(`"${orderAlias}"."order_id"`) })
                .getKnexQuery()
                .toString();
            defaultVersion = knex.raw(`(${sql})`);
        }
        const version = config.where?.version ?? defaultVersion;
        delete config.where?.version;
        configurePopulateWhere(config, isRelatedEntity, version);
        if (!config.options.orderBy) {
            config.options.orderBy = { id: "ASC" };
        }
        config.where ??= {};
        return await manager.find(this.entity, config.where, config.options);
    };
    klass.prototype.findAndCount = async function findAndCount(findOptions = { where: {} }, context = {}) {
        const manager = this.getActiveManager(context);
        const knex = manager.getKnex();
        const findOptions_ = { ...findOptions };
        findOptions_.options ??= {};
        findOptions_.where ??= {};
        if (!("strategy" in findOptions_.options)) {
            Object.assign(findOptions_.options, {
                strategy: core_1.LoadStrategy.SELECT_IN,
            });
        }
        const isRelatedEntity = entity.name !== _models_1.Order.name;
        const config = (0, _1.mapRepositoryToOrderModel)(findOptions_, isRelatedEntity);
        let orderAlias = "o0";
        if (isRelatedEntity) {
            if (entity === _models_1.OrderClaim) {
                if (config.options.populate.includes("additional_items") &&
                    !config.options.populate.includes("claim_items")) {
                    config.options.populate.push("claim_items");
                }
            }
            const index = config.options.populate.findIndex((p) => p === "order");
            if (index > -1) {
                config.options.populate.splice(index, 1);
            }
            config.options.populate.unshift("order");
            orderAlias = "o1";
        }
        let defaultVersion = knex.raw(`"${orderAlias}"."version"`);
        const strategy = config.options.strategy ?? core_1.LoadStrategy.JOINED;
        if (strategy === core_1.LoadStrategy.SELECT_IN) {
            defaultVersion = getVersionSubQuery(manager, orderAlias);
        }
        const version = config.where.version ?? defaultVersion;
        delete config.where.version;
        configurePopulateWhere(config, isRelatedEntity, version, strategy === core_1.LoadStrategy.SELECT_IN, manager);
        if (!config.options.orderBy) {
            config.options.orderBy = { id: "ASC" };
        }
        return await manager.findAndCount(this.entity, config.where, config.options);
    };
}
function getVersionSubQuery(manager, alias, field = "order_id") {
    const knex = manager.getKnex();
    const sql = manager
        .qb((0, utils_1.toMikroORMEntity)(_models_1.Order), "_sub0")
        .select("version")
        .where({ id: knex.raw(`"${alias}"."${field}"`) })
        .getKnexQuery()
        .toString();
    return knex.raw(`(${sql})`);
}
function configurePopulateWhere(config, isRelatedEntity, version, isSelectIn = false, manager) {
    const requestedPopulate = config.options?.populate ?? [];
    const hasRelation = (relation) => requestedPopulate.some((p) => p === relation || p.startsWith(`${relation}.`));
    config.options.populateWhere ??= {};
    const popWhere = config.options.populateWhere;
    // isSelectIn && isRelatedEntity - Order is always the FROM clause (field o0.id)
    if (isRelatedEntity) {
        popWhere.order ??= {};
        const popWhereOrder = popWhere.order;
        popWhereOrder.version = isSelectIn
            ? getVersionSubQuery(manager, "o0", "id")
            : version;
        // related entity shipping method
        if (hasRelation("shipping_methods")) {
            popWhere.shipping_methods ??= {};
            popWhere.shipping_methods.version = isSelectIn
                ? getVersionSubQuery(manager, "s0")
                : version;
        }
        if (hasRelation("items") || hasRelation("order.items")) {
            popWhereOrder.items ??= {};
            popWhereOrder.items.version = isSelectIn
                ? getVersionSubQuery(manager, "o0", "id")
                : version;
        }
        if (hasRelation("shipping_methods")) {
            popWhereOrder.shipping_methods ??= {};
            popWhereOrder.shipping_methods.version = isSelectIn
                ? getVersionSubQuery(manager, "o0", "id")
                : version;
        }
        return;
    }
    if (isSelectIn) {
        version = getVersionSubQuery(manager, "o0");
    }
    if (hasRelation("summary")) {
        popWhere.summary ??= {};
        popWhere.summary.version = version;
    }
    if (hasRelation("items") || hasRelation("order.items")) {
        popWhere.items ??= {};
        popWhere.items.version = version;
    }
    if (hasRelation("shipping_methods")) {
        popWhere.shipping_methods ??= {};
        popWhere.shipping_methods.version = version;
    }
}
//# sourceMappingURL=base-repository-find.js.map