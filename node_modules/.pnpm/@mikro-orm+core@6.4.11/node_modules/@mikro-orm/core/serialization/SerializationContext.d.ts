import type { AnyEntity, EntityMetadata, PopulateOptions } from '../typings';
import type { Configuration } from '../utils/Configuration';
/**
 * Helper that allows to keep track of where we are currently at when serializing complex entity graph with cycles.
 * Before we process a property, we call `visit` that checks if it is not a cycle path (but allows to pass cycles that
 * are defined in populate hint). If not, we proceed and call `leave` afterwards.
 */
export declare class SerializationContext<T extends object> {
    private readonly config;
    private readonly populate;
    private readonly fields?;
    private readonly exclude?;
    readonly path: [string, string][];
    readonly visited: Set<Partial<any>>;
    private entities;
    constructor(config: Configuration, populate?: PopulateOptions<T>[], fields?: Set<string> | undefined, exclude?: string[] | undefined);
    /**
     * Returns true when there is a cycle detected.
     */
    visit(entityName: string, prop: string): boolean;
    leave<U>(entityName: string, prop: string): void;
    close(): void;
    /**
     * When initializing new context, we need to propagate it to the whole entity graph recursively.
     */
    static propagate(root: SerializationContext<any>, entity: AnyEntity, isVisible: (meta: EntityMetadata, prop: string) => boolean): void;
    isMarkedAsPopulated(entityName: string, prop: string): boolean;
    isPartiallyLoaded(entityName: string, prop: string): boolean;
    private register;
}
