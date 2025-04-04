import { AriaToggleProps } from "@react-types/checkbox";
import { InputHTMLAttributes, LabelHTMLAttributes } from "react";
import { RefObject } from "@react-types/shared";
import { ToggleState } from "@react-stately/toggle";
export interface ToggleAria {
    /** Props to be spread on the label element. */
    labelProps: LabelHTMLAttributes<HTMLLabelElement>;
    /** Props to be spread on the input element. */
    inputProps: InputHTMLAttributes<HTMLInputElement>;
    /** Whether the toggle is selected. */
    isSelected: boolean;
    /** Whether the toggle is in a pressed state. */
    isPressed: boolean;
    /** Whether the toggle is disabled. */
    isDisabled: boolean;
    /** Whether the toggle is read only. */
    isReadOnly: boolean;
    /** Whether the toggle is invalid. */
    isInvalid: boolean;
}
/**
 * Handles interactions for toggle elements, e.g. Checkboxes and Switches.
 */
export function useToggle(props: AriaToggleProps, state: ToggleState, ref: RefObject<HTMLInputElement | null>): ToggleAria;
export type { AriaToggleProps } from '@react-types/checkbox';

//# sourceMappingURL=types.d.ts.map
