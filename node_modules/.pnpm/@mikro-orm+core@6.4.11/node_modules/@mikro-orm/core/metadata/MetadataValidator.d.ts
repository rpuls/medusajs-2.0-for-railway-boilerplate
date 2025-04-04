import type { EntityMetadata } from '../typings';
import { type MetadataDiscoveryOptions } from '../utils';
import { ReferenceKind } from '../enums';
import type { MetadataStorage } from './MetadataStorage';
/**
 * @internal
 */
export declare class MetadataValidator {
    /**
     * Validate there is only one property decorator. This disallows using `@Property()` together with e.g. `@ManyToOne()`
     * on the same property. One should use only `@ManyToOne()` in such case.
     * We allow the existence of the property in metadata if the reference type is the same, this should allow things like HMR to work.
     */
    static validateSingleDecorator(meta: EntityMetadata, propertyName: string, reference: ReferenceKind): void;
    validateEntityDefinition<T>(metadata: MetadataStorage, name: string, options: MetadataDiscoveryOptions): void;
    validateDiscovered(discovered: EntityMetadata[], options: MetadataDiscoveryOptions): void;
    private validateReference;
    private validateBidirectional;
    private validateOwningSide;
    private validateInverseSide;
    private validateIndexes;
    private validateDuplicateFieldNames;
    private validateVersionField;
}
