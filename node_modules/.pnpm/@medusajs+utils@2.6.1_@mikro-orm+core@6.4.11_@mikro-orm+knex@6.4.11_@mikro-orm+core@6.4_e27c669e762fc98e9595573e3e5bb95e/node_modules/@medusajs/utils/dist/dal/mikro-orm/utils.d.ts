import { SqlEntityManager } from "@mikro-orm/postgresql";
/**
 * Updates the deleted_at field for all entities in the given array and their
 * cascaded relations and returns a map of entity IDs to their corresponding
 * entity types.
 *
 * @param manager - The Mikro ORM manager instance.
 * @param entities - An array of entities to update.
 * @param value - The value to set for the deleted_at field.
 * @returns A map of entity IDs to their corresponding entity types.
 */
export declare const mikroOrmUpdateDeletedAtRecursively: <T extends object = any>(manager: SqlEntityManager, entities: (T & {
    id: string;
    deleted_at?: string | Date | null;
})[], value: Date | null) => Promise<Map<string, (T & {
    id: string;
    deleted_at?: string | Date | null;
})[]>>;
//# sourceMappingURL=utils.d.ts.map