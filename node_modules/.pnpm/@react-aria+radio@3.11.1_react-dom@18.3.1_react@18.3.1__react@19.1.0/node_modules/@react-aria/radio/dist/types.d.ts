import { AriaRadioProps, AriaRadioGroupProps } from "@react-types/radio";
import { InputHTMLAttributes, LabelHTMLAttributes } from "react";
import { RadioGroupState } from "@react-stately/radio";
import { RefObject, DOMAttributes, ValidationResult } from "@react-types/shared";
export interface RadioAria {
    /** Props for the label wrapper element. */
    labelProps: LabelHTMLAttributes<HTMLLabelElement>;
    /** Props for the input element. */
    inputProps: InputHTMLAttributes<HTMLInputElement>;
    /** Whether the radio is disabled. */
    isDisabled: boolean;
    /** Whether the radio is currently selected. */
    isSelected: boolean;
    /** Whether the radio is in a pressed state. */
    isPressed: boolean;
}
/**
 * Provides the behavior and accessibility implementation for an individual
 * radio button in a radio group.
 * @param props - Props for the radio.
 * @param state - State for the radio group, as returned by `useRadioGroupState`.
 * @param ref - Ref to the HTML input element.
 */
export function useRadio(props: AriaRadioProps, state: RadioGroupState, ref: RefObject<HTMLInputElement | null>): RadioAria;
export interface RadioGroupAria extends ValidationResult {
    /** Props for the radio group wrapper element. */
    radioGroupProps: DOMAttributes;
    /** Props for the radio group's visible label (if any). */
    labelProps: DOMAttributes;
    /** Props for the radio group description element, if any. */
    descriptionProps: DOMAttributes;
    /** Props for the radio group error message element, if any. */
    errorMessageProps: DOMAttributes;
}
/**
 * Provides the behavior and accessibility implementation for a radio group component.
 * Radio groups allow users to select a single item from a list of mutually exclusive options.
 * @param props - Props for the radio group.
 * @param state - State for the radio group, as returned by `useRadioGroupState`.
 */
export function useRadioGroup(props: AriaRadioGroupProps, state: RadioGroupState): RadioGroupAria;
export type { AriaRadioGroupProps, AriaRadioProps } from '@react-types/radio';
export type { Orientation } from '@react-types/shared';

//# sourceMappingURL=types.d.ts.map
