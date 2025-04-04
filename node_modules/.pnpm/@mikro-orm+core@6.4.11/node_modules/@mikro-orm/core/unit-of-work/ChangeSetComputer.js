"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeSetComputer = void 0;
const utils_1 = require("../utils");
const ChangeSet_1 = require("./ChangeSet");
const entity_1 = require("../entity");
const enums_1 = require("../enums");
class ChangeSetComputer {
    validator;
    collectionUpdates;
    metadata;
    platform;
    config;
    em;
    comparator;
    constructor(validator, collectionUpdates, metadata, platform, config, em) {
        this.validator = validator;
        this.collectionUpdates = collectionUpdates;
        this.metadata = metadata;
        this.platform = platform;
        this.config = config;
        this.em = em;
        this.comparator = this.config.getComparator(this.metadata);
    }
    computeChangeSet(entity) {
        const meta = this.metadata.get(entity.constructor.name);
        if (meta.readonly) {
            return null;
        }
        const wrapped = (0, entity_1.helper)(entity);
        const type = wrapped.__originalEntityData ? ChangeSet_1.ChangeSetType.UPDATE : ChangeSet_1.ChangeSetType.CREATE;
        const map = new Map();
        // Execute `onCreate` and `onUpdate` on properties recursively, saves `onUpdate` results
        // to the `map` as we want to apply those only if something else changed.
        if (type === ChangeSet_1.ChangeSetType.CREATE) { // run update hooks only after we know there are other changes
            for (const prop of meta.hydrateProps) {
                this.processPropertyInitializers(entity, prop, type, map);
            }
        }
        if (type === ChangeSet_1.ChangeSetType.UPDATE && !wrapped.__initialized && !wrapped.isTouched()) {
            return null;
        }
        const changeSet = new ChangeSet_1.ChangeSet(entity, type, this.computePayload(entity), meta);
        changeSet.originalEntity = wrapped.__originalEntityData;
        if (this.config.get('validate')) {
            this.validator.validate(changeSet.entity, changeSet.payload, meta);
        }
        for (const prop of meta.relations.filter(prop => prop.persist !== false || prop.userDefined === false)) {
            this.processProperty(changeSet, prop);
        }
        if (changeSet.type === ChangeSet_1.ChangeSetType.UPDATE && !utils_1.Utils.hasObjectKeys(changeSet.payload)) {
            return null;
        }
        // Execute `onCreate` and `onUpdate` on properties recursively, saves `onUpdate` results
        // to the `map` as we want to apply those only if something else changed.
        if (type === ChangeSet_1.ChangeSetType.UPDATE) {
            for (const prop of meta.hydrateProps) {
                this.processPropertyInitializers(entity, prop, type, map);
            }
        }
        if (map.size > 0) {
            for (const [entity, pairs] of map) {
                for (const [prop, value] of pairs) {
                    entity[prop] = value;
                }
            }
            // Recompute the changeset, we need to merge this as here we ignore relations.
            const diff = this.computePayload(entity, true);
            utils_1.Utils.merge(changeSet.payload, diff);
        }
        return changeSet;
    }
    /**
     * Traverses entity graph and executes `onCreate` and `onUpdate` methods, assigning the values to given properties.
     */
    processPropertyInitializers(entity, prop, type, map, nested) {
        if (prop.onCreate
            && type === ChangeSet_1.ChangeSetType.CREATE
            && (entity[prop.name] == null
                || (utils_1.Utils.isScalarReference(entity[prop.name]) && entity[prop.name].unwrap() == null))) {
            entity[prop.name] = prop.onCreate(entity, this.em);
        }
        if (prop.onUpdate && type === ChangeSet_1.ChangeSetType.UPDATE) {
            const pairs = map.get(entity) ?? [];
            pairs.push([prop.name, prop.onUpdate(entity, this.em)]);
            map.set(entity, pairs);
        }
        if (prop.kind === enums_1.ReferenceKind.EMBEDDED && entity[prop.name]) {
            for (const embeddedProp of prop.targetMeta.hydrateProps) {
                this.processPropertyInitializers(entity[prop.name], embeddedProp, type, map, nested || prop.object);
            }
        }
    }
    computePayload(entity, ignoreUndefined = false) {
        const data = this.comparator.prepareEntity(entity);
        const wrapped = (0, entity_1.helper)(entity);
        const entityName = wrapped.__meta.className;
        const originalEntityData = wrapped.__originalEntityData;
        if (!wrapped.__initialized) {
            for (const prop of wrapped.__meta.primaryKeys) {
                delete data[prop];
            }
            return data;
        }
        if (originalEntityData) {
            const comparator = this.comparator.getEntityComparator(entityName);
            const diff = comparator(originalEntityData, data);
            if (ignoreUndefined) {
                utils_1.Utils.keys(diff)
                    .filter(k => diff[k] === undefined)
                    .forEach(k => delete diff[k]);
            }
            return diff;
        }
        return data;
    }
    processProperty(changeSet, prop, target) {
        if (!target) {
            const targets = utils_1.Utils.unwrapProperty(changeSet.entity, changeSet.meta, prop);
            targets.forEach(([t]) => this.processProperty(changeSet, prop, t));
            return;
        }
        if (utils_1.Utils.isCollection(target)) { // m:n or 1:m
            this.processToMany(prop, changeSet);
        }
        if ([enums_1.ReferenceKind.MANY_TO_ONE, enums_1.ReferenceKind.ONE_TO_ONE].includes(prop.kind)) {
            this.processToOne(prop, changeSet);
        }
    }
    processToOne(prop, changeSet) {
        const isToOneOwner = prop.kind === enums_1.ReferenceKind.MANY_TO_ONE || (prop.kind === enums_1.ReferenceKind.ONE_TO_ONE && prop.owner);
        if (!isToOneOwner || prop.mapToPk) {
            return;
        }
        const targets = utils_1.Utils.unwrapProperty(changeSet.entity, changeSet.meta, prop);
        targets.forEach(([target, idx]) => {
            if (!target.__helper.hasPrimaryKey()) {
                utils_1.Utils.setPayloadProperty(changeSet.payload, this.metadata.find(changeSet.name), prop, target.__helper.__identifier, idx);
            }
        });
    }
    processToMany(prop, changeSet) {
        const target = changeSet.entity[prop.name];
        if (!target.isDirty() && changeSet.type !== ChangeSet_1.ChangeSetType.CREATE) {
            return;
        }
        this.collectionUpdates.add(target);
        if (prop.owner && !this.platform.usesPivotTable()) {
            changeSet.payload[prop.name] = target.getItems(false).map((item) => item.__helper.__identifier ?? item.__helper.getPrimaryKey());
        }
    }
}
exports.ChangeSetComputer = ChangeSetComputer;
