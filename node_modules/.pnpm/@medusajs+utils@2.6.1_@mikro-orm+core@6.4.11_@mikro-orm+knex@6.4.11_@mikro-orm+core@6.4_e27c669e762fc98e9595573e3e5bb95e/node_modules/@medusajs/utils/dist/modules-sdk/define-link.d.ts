import { LinkModulesExtraFields } from "@medusajs/types";
export declare const DefineLinkSymbol: unique symbol;
export interface DefineLinkExport {
    [DefineLinkSymbol]: boolean;
    serviceName: string;
    entity?: string;
    entryPoint: string;
}
type InputSource = {
    serviceName: string;
    field: string;
    entity?: string;
    alias?: string;
    linkable: string;
    primaryKey: string;
};
type ReadOnlyInputSource = {
    linkable: CombinedSource | InputSource | {
        serviceName: string;
        entity?: string;
    };
    field?: string;
};
type InputToJson = {
    toJSON: () => InputSource;
};
type CombinedSource = Record<any, any> & InputToJson;
type InputOptions = {
    linkable: CombinedSource | InputSource;
    field?: string;
    isList?: boolean;
    deleteCascade?: boolean;
};
type Shortcut = {
    property: string;
    path: string;
    isList?: boolean;
    forwardArguments?: string | string[];
};
type ExtraOptions = {
    pk?: {
        [key: string]: string;
    };
    database?: {
        table?: string;
        idPrefix?: string;
        extraColumns?: LinkModulesExtraFields;
    };
    readOnly?: boolean;
};
type ReadOnlyExtraOptions = {
    readOnly: true;
    isList?: boolean;
    shortcut?: Shortcut | Shortcut[];
};
type DefineLinkInputSource = InputSource | InputOptions | CombinedSource;
type DefineReadOnlyLinkInputSource = ReadOnlyInputSource | InputOptions | CombinedSource;
/**
 * Generate a ModuleJoinerConfig for the link definition on the fly.
 * All naming, aliases etc are following our conventional naming.
 *
 * @param leftService
 * @param rightService
 * @param linkServiceOptions
 */
export declare function defineLink(leftService: DefineLinkInputSource | DefineReadOnlyLinkInputSource, rightService: DefineLinkInputSource | DefineReadOnlyLinkInputSource, linkServiceOptions?: ExtraOptions | ReadOnlyExtraOptions): DefineLinkExport;
export {};
//# sourceMappingURL=define-link.d.ts.map