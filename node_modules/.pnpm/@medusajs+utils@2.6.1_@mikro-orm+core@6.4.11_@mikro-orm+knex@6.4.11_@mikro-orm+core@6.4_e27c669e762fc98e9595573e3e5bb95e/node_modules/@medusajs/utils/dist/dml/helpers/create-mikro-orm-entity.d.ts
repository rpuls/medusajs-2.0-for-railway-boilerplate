import type { IDmlEntity, Infer } from "@medusajs/types";
import { DmlEntity } from "../entity";
/**
 * Helper function to convert DML entities to MikroORM entity. Use
 * "toMikroORMEntity" if you are ensure the input is a DML entity
 * or not.
 */
export declare const mikroORMEntityBuilder: {
    <T extends DmlEntity<any, any>>(entity: T): Infer<T>;
    /**
     * Clear the internally tracked entities and relationships
     */
    clear(): void;
};
/**
 * Takes a DML entity and returns a Mikro ORM entity otherwise
 * return the input idempotently
 * @param entity
 */
export declare const toMikroORMEntity: <T>(entity: T) => T extends IDmlEntity<any, any> ? Infer<T> : T;
/**
 * Takes any DmlEntity or mikro orm entities and return mikro orm entities only.
 * This action is idempotent if non of the entities are DmlEntity
 * @param entities
 */
export declare const toMikroOrmEntities: <T extends any[]>(entities: T) => { [K in keyof T]: T[K] extends IDmlEntity<any, any> ? Infer<T[K]> : T[K]; };
//# sourceMappingURL=create-mikro-orm-entity.d.ts.map