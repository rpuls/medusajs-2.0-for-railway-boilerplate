import { Checkbox as RadixCheckbox } from "radix-ui";
import * as React from "react";
import { CheckboxCheckedState } from "./types";
/**
 * This component is based on the [Radix UI Checkbox](https://www.radix-ui.com/primitives/docs/components/checkbox) primitive.
 */
declare const Checkbox: React.ForwardRefExoticComponent<Omit<RadixCheckbox.CheckboxProps & React.RefAttributes<HTMLButtonElement>, "ref"> & {
    checked?: CheckboxCheckedState | undefined;
} & React.RefAttributes<HTMLButtonElement>>;
export { Checkbox };
//# sourceMappingURL=checkbox.d.ts.map