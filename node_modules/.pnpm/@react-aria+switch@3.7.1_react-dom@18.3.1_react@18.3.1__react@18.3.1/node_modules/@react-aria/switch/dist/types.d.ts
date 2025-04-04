import { AriaSwitchProps } from "@react-types/switch";
import { InputHTMLAttributes, LabelHTMLAttributes } from "react";
import { RefObject } from "@react-types/shared";
import { ToggleState } from "@react-stately/toggle";
export interface SwitchAria {
    /** Props for the label wrapper element. */
    labelProps: LabelHTMLAttributes<HTMLLabelElement>;
    /** Props for the input element. */
    inputProps: InputHTMLAttributes<HTMLInputElement>;
    /** Whether the switch is selected. */
    isSelected: boolean;
    /** Whether the switch is in a pressed state. */
    isPressed: boolean;
    /** Whether the switch is disabled. */
    isDisabled: boolean;
    /** Whether the switch is read only. */
    isReadOnly: boolean;
}
/**
 * Provides the behavior and accessibility implementation for a switch component.
 * A switch is similar to a checkbox, but represents on/off values as opposed to selection.
 * @param props - Props for the switch.
 * @param state - State for the switch, as returned by `useToggleState`.
 * @param ref - Ref to the HTML input element.
 */
export function useSwitch(props: AriaSwitchProps, state: ToggleState, ref: RefObject<HTMLInputElement | null>): SwitchAria;
export type { AriaSwitchProps } from '@react-types/switch';

//# sourceMappingURL=types.d.ts.map
