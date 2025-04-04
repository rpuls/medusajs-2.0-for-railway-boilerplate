"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityHelper = void 0;
const node_util_1 = require("node:util");
const typings_1 = require("../typings");
const EntityTransformer_1 = require("../serialization/EntityTransformer");
const Reference_1 = require("./Reference");
const Utils_1 = require("../utils/Utils");
const WrappedEntity_1 = require("./WrappedEntity");
const enums_1 = require("../enums");
const wrap_1 = require("./wrap");
/**
 * @internal
 */
class EntityHelper {
    static decorate(meta, em) {
        const fork = em.fork(); // use fork so we can access `EntityFactory`
        const serializedPrimaryKey = meta.props.find(p => p.serializedPrimaryKey);
        if (serializedPrimaryKey) {
            Object.defineProperty(meta.prototype, serializedPrimaryKey.name, {
                get() {
                    return this._id ? em.getPlatform().normalizePrimaryKey(this._id) : null;
                },
                set(id) {
                    this._id = id ? em.getPlatform().denormalizePrimaryKey(id) : null;
                },
                configurable: true,
            });
        }
        EntityHelper.defineBaseProperties(meta, meta.prototype, fork);
        EntityHelper.defineCustomInspect(meta);
        if (em.config.get('propagationOnPrototype') && !meta.embeddable && !meta.virtual) {
            EntityHelper.defineProperties(meta, fork);
        }
        const prototype = meta.prototype;
        if (!prototype.toJSON) { // toJSON can be overridden
            prototype.toJSON = function (...args) {
                return EntityTransformer_1.EntityTransformer.toObject(this, ...args.slice(meta.toJsonParams.length));
            };
        }
    }
    /**
     * As a performance optimization, we create entity state methods in a lazy manner. We first add
     * the `null` value to the prototype to reserve space in memory. Then we define a setter on the
     * prototype, that will be executed exactly once per entity instance. There we redefine given
     * property on the entity instance, so shadowing the prototype setter.
     */
    static defineBaseProperties(meta, prototype, em) {
        const helperParams = meta.embeddable || meta.virtual ? [] : [em.getComparator().getPkGetter(meta), em.getComparator().getPkSerializer(meta), em.getComparator().getPkGetterConverted(meta)];
        Object.defineProperties(prototype, {
            __entity: { value: !meta.embeddable, configurable: true },
            __meta: { value: meta, configurable: true },
            __config: { value: em.config, configurable: true },
            __platform: { value: em.getPlatform(), configurable: true },
            __factory: { value: em.getEntityFactory(), configurable: true },
            __helper: {
                get() {
                    Object.defineProperty(this, '__helper', {
                        value: new WrappedEntity_1.WrappedEntity(this, em.getHydrator(), ...helperParams),
                        enumerable: false,
                        configurable: true,
                    });
                    return this.__helper;
                },
                configurable: true, // otherwise jest fails when trying to compare entities ¯\_(ツ)_/¯
            },
        });
    }
    /**
     * Defines getter and setter for every owning side of m:1 and 1:1 relation. This is then used for propagation of
     * changes to the inverse side of bi-directional relations. Rest of the properties are also defined this way to
     * achieve dirtiness, which is then used for fast checks whether we need to auto-flush because of managed entities.
     *
     * First defines a setter on the prototype, once called, actual get/set handlers are registered on the instance rather
     * than on its prototype. Thanks to this we still have those properties enumerable (e.g. part of `Object.keys(entity)`).
     */
    static defineProperties(meta, em) {
        Object
            .values(meta.properties)
            .forEach(prop => {
            const isCollection = [enums_1.ReferenceKind.ONE_TO_MANY, enums_1.ReferenceKind.MANY_TO_MANY].includes(prop.kind);
            const isReference = [enums_1.ReferenceKind.ONE_TO_ONE, enums_1.ReferenceKind.MANY_TO_ONE].includes(prop.kind) && (prop.inversedBy || prop.mappedBy) && !prop.mapToPk;
            if (isReference) {
                Object.defineProperty(meta.prototype, prop.name, {
                    set(val) {
                        EntityHelper.defineReferenceProperty(meta, prop, this, em.getHydrator());
                        this[prop.name] = val;
                    },
                    configurable: true,
                });
                return;
            }
            if (prop.inherited || prop.primary || prop.persist === false || prop.trackChanges === false || prop.embedded || isCollection) {
                return;
            }
            Object.defineProperty(meta.prototype, prop.name, {
                set(val) {
                    Object.defineProperty(this, prop.name, {
                        get() {
                            return this.__helper?.__data[prop.name];
                        },
                        set(val) {
                            this.__helper.__data[prop.name] = val;
                            this.__helper.__touched = !this.__helper.hydrator.isRunning();
                        },
                        enumerable: true,
                        configurable: true,
                    });
                    this.__helper.__data[prop.name] = val;
                    this.__helper.__touched = !this.__helper.hydrator.isRunning();
                },
                configurable: true,
            });
        });
    }
    static defineCustomInspect(meta) {
        // @ts-ignore
        meta.prototype[node_util_1.inspect.custom] ??= function (depth = 2) {
            const object = { ...this };
            // ensure we dont have internal symbols in the POJO
            [typings_1.OptionalProps, typings_1.EntityRepositoryType, typings_1.PrimaryKeyProp, typings_1.EagerProps, typings_1.HiddenProps].forEach(sym => delete object[sym]);
            meta.props
                .filter(prop => object[prop.name] === undefined)
                .forEach(prop => delete object[prop.name]);
            const ret = (0, node_util_1.inspect)(object, { depth });
            let name = (this).constructor.name;
            const showEM = ['true', 't', '1'].includes(process.env.MIKRO_ORM_LOG_EM_ID?.toString().toLowerCase() ?? '');
            if (showEM) {
                if ((0, wrap_1.helper)(this).__em) {
                    name += ` [managed by ${(0, wrap_1.helper)(this).__em.id}]`;
                }
                else {
                    name += ` [not managed]`;
                }
            }
            // distinguish not initialized entities
            if (!(0, wrap_1.helper)(this).__initialized) {
                name = `(${name})`;
            }
            return ret === '[Object]' ? `[${name}]` : name + ' ' + ret;
        };
    }
    static defineReferenceProperty(meta, prop, ref, hydrator) {
        const wrapped = (0, wrap_1.helper)(ref);
        Object.defineProperty(ref, prop.name, {
            get() {
                return (0, wrap_1.helper)(ref).__data[prop.name];
            },
            set(val) {
                const entity = Reference_1.Reference.unwrapReference(val ?? wrapped.__data[prop.name]);
                const old = Reference_1.Reference.unwrapReference(wrapped.__data[prop.name]);
                wrapped.__data[prop.name] = Reference_1.Reference.wrapReference(val, prop);
                // when propagation from inside hydration, we set the FK to the entity data immediately
                if (val && hydrator.isRunning() && wrapped.__originalEntityData && prop.owner) {
                    wrapped.__originalEntityData[prop.name] = Utils_1.Utils.getPrimaryKeyValues(wrapped.__data[prop.name], prop.targetMeta.primaryKeys, true);
                }
                else {
                    wrapped.__touched = !hydrator.isRunning();
                }
                EntityHelper.propagate(meta, entity, this, prop, Reference_1.Reference.unwrapReference(val), old);
            },
            enumerable: true,
            configurable: true,
        });
    }
    static propagate(meta, entity, owner, prop, value, old) {
        for (const prop2 of prop.targetMeta.bidirectionalRelations) {
            if ((prop2.inversedBy || prop2.mappedBy) !== prop.name) {
                continue;
            }
            if (prop2.targetMeta.abstract ? prop2.targetMeta.root.class !== meta.root.class : prop2.targetMeta.class !== meta.class) {
                continue;
            }
            const inverse = value?.[prop2.name];
            if (prop.kind === enums_1.ReferenceKind.MANY_TO_ONE && Utils_1.Utils.isCollection(inverse) && inverse.isInitialized()) {
                inverse.addWithoutPropagation(owner);
                (0, wrap_1.helper)(owner).__em?.getUnitOfWork().cancelOrphanRemoval(owner);
            }
            if (prop.kind === enums_1.ReferenceKind.ONE_TO_ONE) {
                if ((value != null && Reference_1.Reference.unwrapReference(inverse) !== owner) ||
                    (value == null && entity?.[prop2.name] != null)) {
                    if (entity && (!prop.owner || (0, wrap_1.helper)(entity).__initialized)) {
                        EntityHelper.propagateOneToOne(entity, owner, prop, prop2, value, old);
                    }
                    if (old && prop.orphanRemoval) {
                        (0, wrap_1.helper)(old).__em?.getUnitOfWork().scheduleOrphanRemoval(old);
                    }
                }
            }
        }
    }
    static propagateOneToOne(entity, owner, prop, prop2, value, old) {
        (0, wrap_1.helper)(entity).__pk = (0, wrap_1.helper)(entity).getPrimaryKey();
        // the inverse side will be changed on the `value` too, so we need to clean-up and schedule orphan removal there too
        if (!prop.primary && !prop2.mapToPk && value?.[prop2.name] != null && Reference_1.Reference.unwrapReference(value[prop2.name]) !== entity) {
            const other = Reference_1.Reference.unwrapReference(value[prop2.name]);
            delete (0, wrap_1.helper)(other).__data[prop.name];
            if (prop2.orphanRemoval) {
                (0, wrap_1.helper)(other).__em?.getUnitOfWork().scheduleOrphanRemoval(other);
            }
        }
        if (value == null) {
            entity[prop2.name] = value;
        }
        else if (prop2.mapToPk) {
            entity[prop2.name] = (0, wrap_1.helper)(owner).getPrimaryKey();
        }
        else {
            entity[prop2.name] = Reference_1.Reference.wrapReference(owner, prop);
        }
        if (old?.[prop2.name] != null) {
            delete (0, wrap_1.helper)(old).__data[prop2.name];
        }
    }
    static ensurePropagation(entity) {
        if (entity.__gettersDefined) {
            return;
        }
        const wrapped = (0, wrap_1.helper)(entity);
        const meta = wrapped.__meta;
        const platform = wrapped.__platform;
        const serializedPrimaryKey = meta.props.find(p => p.serializedPrimaryKey);
        const values = [];
        if (serializedPrimaryKey) {
            const pk = meta.getPrimaryProps()[0];
            const val = entity[serializedPrimaryKey.name];
            delete entity[serializedPrimaryKey.name];
            Object.defineProperty(entity, serializedPrimaryKey.name, {
                get() {
                    return this[pk.name] ? platform.normalizePrimaryKey(this[pk.name]) : null;
                },
                set(id) {
                    this[pk.name] = id ? platform.denormalizePrimaryKey(id) : null;
                },
                configurable: true,
            });
            if (entity[pk.name] == null && val != null) {
                values.push(serializedPrimaryKey.name, val);
            }
        }
        for (const prop of meta.trackingProps) {
            if (entity[prop.name] !== undefined) {
                values.push(prop.name, entity[prop.name]);
            }
            delete entity[prop.name];
        }
        Object.defineProperties(entity, meta.definedProperties);
        for (let i = 0; i < values.length; i += 2) {
            entity[values[i]] = values[i + 1];
        }
    }
}
exports.EntityHelper = EntityHelper;
