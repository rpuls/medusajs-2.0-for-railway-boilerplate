import { BaseProperty } from "./base";
/**
 * The FloatProperty is used to define values with decimal
 * places.
 */
export declare class FloatProperty extends BaseProperty<number> {
    protected dataType: {
        readonly name: "float";
    };
    static isFloatProperty(obj: any): obj is FloatProperty;
}
//# sourceMappingURL=float.d.ts.map