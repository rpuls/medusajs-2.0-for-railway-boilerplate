import { BaseProperty } from "./base";
export type EnumLike = {
    [K: string]: string | number;
    [number: number]: string;
};
/**
 * The EnumProperty is used to define a property with pre-defined
 * list of choices.
 */
export declare class EnumProperty<const Values extends unknown[] | EnumLike> extends BaseProperty<Values extends EnumLike ? Values[keyof Values] : Values[number]> {
    protected dataType: {
        name: "enum";
        options: {
            choices: any[];
        };
    };
    constructor(values: Values);
}
//# sourceMappingURL=enum.d.ts.map