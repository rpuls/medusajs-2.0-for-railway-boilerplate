import type { ReferenceOptions } from './Property';
import { ReferenceKind, type QueryOrderMap } from '../enums';
import type { EntityName, AnyEntity, FilterQuery } from '../typings';
export declare function createOneToDecorator<Target, Owner>(entity: OneToManyOptions<Owner, Target> | string | ((e?: any) => EntityName<Target>), mappedBy: (string & keyof Target) | ((e: Target) => any) | undefined, options: Partial<OneToManyOptions<Owner, Target>>, kind: ReferenceKind): (target: AnyEntity, propertyName: string) => any;
export declare function OneToMany<Target, Owner>(entity: string | ((e?: any) => EntityName<Target>), mappedBy: (string & keyof Target) | ((e: Target) => any), options?: Partial<OneToManyOptions<Owner, Target>>): (target: AnyEntity, propertyName: string) => void;
export declare function OneToMany<Target, Owner>(options: OneToManyOptions<Owner, Target>): (target: AnyEntity, propertyName: string) => void;
export interface OneToManyOptions<Owner, Target> extends ReferenceOptions<Owner, Target> {
    /** Remove the entity when it gets disconnected from the relationship (see {@doclink cascading | Cascading}). */
    orphanRemoval?: boolean;
    /** Set default ordering. */
    orderBy?: QueryOrderMap<Target> | QueryOrderMap<Target>[];
    /** Condition for {@doclink collections#declarative-partial-loading | Declarative partial loading}. */
    where?: FilterQuery<Target>;
    /** Override the default database column name on the owning side (see {@doclink naming-strategy | Naming Strategy}). This option is only for simple properties represented by a single column. */
    joinColumn?: string;
    /** Override the default database column name on the owning side (see {@doclink naming-strategy | Naming Strategy}). This option is suitable for composite keys, where one property is represented by multiple columns. */
    joinColumns?: string[];
    /** Override the default database column name on the inverse side (see {@doclink naming-strategy | Naming Strategy}). This option is only for simple properties represented by a single column. */
    inverseJoinColumn?: string;
    /** Override the default database column name on the inverse side (see {@doclink naming-strategy | Naming Strategy}). This option is suitable for composite keys, where one property is represented by multiple columns. */
    inverseJoinColumns?: string[];
    /** Override the default database column name on the target entity (see {@doclink naming-strategy | Naming Strategy}). This option is only for simple properties represented by a single column. */
    referenceColumnName?: string;
    /** Override the default database column name on the target entity (see {@doclink naming-strategy | Naming Strategy}). This option is suitable for composite keys, where one property is represented by multiple columns. */
    referencedColumnNames?: string[];
    /** Point to the owning side property name. */
    mappedBy: (string & keyof Target) | ((e: Target) => any);
}
