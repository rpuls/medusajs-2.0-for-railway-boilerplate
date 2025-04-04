import type { AnyEntity } from '../typings';
export declare function Embedded<T extends object>(type?: EmbeddedOptions | (() => AnyEntity), options?: EmbeddedOptions): (target: AnyEntity, propertyName: string) => any;
/** With `absolute` the prefix is set at the root of the entity (regardless of the nesting level) */
export type EmbeddedPrefixMode = 'absolute' | 'relative';
export type EmbeddedOptions = {
    entity?: string | (() => AnyEntity | AnyEntity[]);
    type?: string;
    prefix?: string | boolean;
    prefixMode?: EmbeddedPrefixMode;
    nullable?: boolean;
    object?: boolean;
    array?: boolean;
    hidden?: boolean;
    serializer?: (value: any) => any;
    serializedName?: string;
    groups?: string[];
    persist?: boolean;
};
