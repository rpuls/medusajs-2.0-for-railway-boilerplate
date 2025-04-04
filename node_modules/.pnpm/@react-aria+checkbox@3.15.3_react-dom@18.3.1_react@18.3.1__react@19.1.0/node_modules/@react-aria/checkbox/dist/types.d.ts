import { AriaCheckboxProps, AriaCheckboxGroupProps, AriaCheckboxGroupItemProps } from "@react-types/checkbox";
import { InputHTMLAttributes, LabelHTMLAttributes } from "react";
import { RefObject, ValidationResult, DOMAttributes } from "@react-types/shared";
import { ToggleState } from "@react-stately/toggle";
import { CheckboxGroupState } from "@react-stately/checkbox";
export interface CheckboxAria extends ValidationResult {
    /** Props for the label wrapper element. */
    labelProps: LabelHTMLAttributes<HTMLLabelElement>;
    /** Props for the input element. */
    inputProps: InputHTMLAttributes<HTMLInputElement>;
    /** Whether the checkbox is selected. */
    isSelected: boolean;
    /** Whether the checkbox is in a pressed state. */
    isPressed: boolean;
    /** Whether the checkbox is disabled. */
    isDisabled: boolean;
    /** Whether the checkbox is read only. */
    isReadOnly: boolean;
}
/**
 * Provides the behavior and accessibility implementation for a checkbox component.
 * Checkboxes allow users to select multiple items from a list of individual items, or
 * to mark one individual item as selected.
 * @param props - Props for the checkbox.
 * @param state - State for the checkbox, as returned by `useToggleState`.
 * @param inputRef - A ref for the HTML input element.
 */
export function useCheckbox(props: AriaCheckboxProps, state: ToggleState, inputRef: RefObject<HTMLInputElement | null>): CheckboxAria;
export interface CheckboxGroupAria extends ValidationResult {
    /** Props for the checkbox group wrapper element. */
    groupProps: DOMAttributes;
    /** Props for the checkbox group's visible label (if any). */
    labelProps: DOMAttributes;
    /** Props for the checkbox group description element, if any. */
    descriptionProps: DOMAttributes;
    /** Props for the checkbox group error message element, if any. */
    errorMessageProps: DOMAttributes;
}
/**
 * Provides the behavior and accessibility implementation for a checkbox group component.
 * Checkbox groups allow users to select multiple items from a list of options.
 * @param props - Props for the checkbox group.
 * @param state - State for the checkbox group, as returned by `useCheckboxGroupState`.
 */
export function useCheckboxGroup(props: AriaCheckboxGroupProps, state: CheckboxGroupState): CheckboxGroupAria;
/**
 * Provides the behavior and accessibility implementation for a checkbox component contained within a checkbox group.
 * Checkbox groups allow users to select multiple items from a list of options.
 * @param props - Props for the checkbox.
 * @param state - State for the checkbox, as returned by `useCheckboxGroupState`.
 * @param inputRef - A ref for the HTML input element.
 */
export function useCheckboxGroupItem(props: AriaCheckboxGroupItemProps, state: CheckboxGroupState, inputRef: RefObject<HTMLInputElement | null>): CheckboxAria;
export type { AriaCheckboxGroupItemProps, AriaCheckboxGroupProps, AriaCheckboxProps } from '@react-types/checkbox';

//# sourceMappingURL=types.d.ts.map
