import 'reflect-metadata';
import type { EntityMetadata, EntityProperty } from '../typings';
import { MetadataProvider } from './MetadataProvider';
export declare class ReflectMetadataProvider extends MetadataProvider {
    loadEntityMetadata(meta: EntityMetadata, name: string): void;
    protected initProperties(meta: EntityMetadata): void;
    protected initPropertyType(meta: EntityMetadata, prop: EntityProperty): void;
}
