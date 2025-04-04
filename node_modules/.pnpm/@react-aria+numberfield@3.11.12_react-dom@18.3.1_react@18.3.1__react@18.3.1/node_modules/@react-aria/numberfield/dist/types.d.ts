import { AriaButtonProps } from "@react-types/button";
import { AriaNumberFieldProps } from "@react-types/numberfield";
import { DOMAttributes, GroupDOMAttributes, ValidationResult } from "@react-types/shared";
import { InputHTMLAttributes, LabelHTMLAttributes, RefObject } from "react";
import { NumberFieldState } from "@react-stately/numberfield";
export interface NumberFieldAria extends ValidationResult {
    /** Props for the label element. */
    labelProps: LabelHTMLAttributes<HTMLLabelElement>;
    /** Props for the group wrapper around the input and stepper buttons. */
    groupProps: GroupDOMAttributes;
    /** Props for the input element. */
    inputProps: InputHTMLAttributes<HTMLInputElement>;
    /** Props for the increment button, to be passed to [useButton](useButton.html). */
    incrementButtonProps: AriaButtonProps;
    /** Props for the decrement button, to be passed to [useButton](useButton.html). */
    decrementButtonProps: AriaButtonProps;
    /** Props for the number field's description element, if any. */
    descriptionProps: DOMAttributes;
    /** Props for the number field's error message element, if any. */
    errorMessageProps: DOMAttributes;
}
/**
 * Provides the behavior and accessibility implementation for a number field component.
 * Number fields allow users to enter a number, and increment or decrement the value using stepper buttons.
 */
export function useNumberField(props: AriaNumberFieldProps, state: NumberFieldState, inputRef: RefObject<HTMLInputElement | null>): NumberFieldAria;
export type { AriaNumberFieldProps } from '@react-types/numberfield';

//# sourceMappingURL=types.d.ts.map
