import { EntityDTO, Loaded, SerializeOptions } from "@mikro-orm/core";
type CustomSerializeOptions<T, P = any> = SerializeOptions<T, P & string> & {
    preventCircularRef?: boolean;
    populate?: [keyof T][] | boolean;
};
export declare class EntitySerializer {
    static serialize<T extends object, P extends string = never>(entity: T, options?: CustomSerializeOptions<T, P>, parents?: string[]): EntityDTO<Loaded<T, P>>;
    private static propertyName;
    private static processProperty;
    private static extractChildOptions;
    private static processEntity;
    private static processCollection;
}
export declare const mikroOrmSerializer: <TOutput extends object>(data: any, options?: Parameters<typeof EntitySerializer.serialize>[1] & {
    preventCircularRef?: boolean;
    populate?: string[] | boolean;
}) => Promise<TOutput>;
export {};
//# sourceMappingURL=mikro-orm-serializer.d.ts.map