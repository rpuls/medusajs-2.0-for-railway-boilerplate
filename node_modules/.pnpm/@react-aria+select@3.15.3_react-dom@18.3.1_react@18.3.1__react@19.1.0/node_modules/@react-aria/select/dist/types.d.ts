import { AriaButtonProps } from "@react-types/button";
import { AriaListBoxOptions } from "@react-aria/listbox";
import { AriaSelectProps } from "@react-types/select";
import { DOMAttributes, KeyboardDelegate, RefObject, ValidationResult, FocusableElement } from "@react-types/shared";
import { SelectState } from "@react-stately/select";
import React, { ReactNode } from "react";
export interface AriaSelectOptions<T> extends Omit<AriaSelectProps<T>, 'children'> {
    /**
     * An optional keyboard delegate implementation for type to select,
     * to override the default.
     */
    keyboardDelegate?: KeyboardDelegate;
}
export interface SelectAria<T> extends ValidationResult {
    /** Props for the label element. */
    labelProps: DOMAttributes;
    /** Props for the popup trigger element. */
    triggerProps: AriaButtonProps;
    /** Props for the element representing the selected value. */
    valueProps: DOMAttributes;
    /** Props for the popup. */
    menuProps: AriaListBoxOptions<T>;
    /** Props for the select's description element, if any. */
    descriptionProps: DOMAttributes;
    /** Props for the select's error message element, if any. */
    errorMessageProps: DOMAttributes;
}
/**
 * Provides the behavior and accessibility implementation for a select component.
 * A select displays a collapsible list of options and allows a user to select one of them.
 * @param props - Props for the select.
 * @param state - State for the select, as returned by `useListState`.
 */
export function useSelect<T>(props: AriaSelectOptions<T>, state: SelectState<T>, ref: RefObject<HTMLElement | null>): SelectAria<T>;
export interface AriaHiddenSelectProps {
    /**
     * Describes the type of autocomplete functionality the input should provide if any. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete).
     */
    autoComplete?: string;
    /** The text label for the select. */
    label?: ReactNode;
    /** HTML form input name. */
    name?: string;
    /** Sets the disabled state of the select and input. */
    isDisabled?: boolean;
}
export interface HiddenSelectProps<T> extends AriaHiddenSelectProps {
    /** State for the select. */
    state: SelectState<T>;
    /** A ref to the trigger element. */
    triggerRef: RefObject<FocusableElement | null>;
}
interface AriaHiddenSelectOptions extends AriaHiddenSelectProps {
    /** A ref to the hidden `<select>` element. */
    selectRef?: RefObject<HTMLSelectElement | null>;
}
interface HiddenSelectAria {
    /** Props for the container element. */
    containerProps: React.HTMLAttributes<FocusableElement>;
    /** Props for the hidden input element. */
    inputProps: React.InputHTMLAttributes<HTMLInputElement>;
    /** Props for the hidden select element. */
    selectProps: React.SelectHTMLAttributes<HTMLSelectElement>;
}
/**
 * Provides the behavior and accessibility implementation for a hidden `<select>` element, which
 * can be used in combination with `useSelect` to support browser form autofill, mobile form
 * navigation, and native HTML form submission.
 */
export function useHiddenSelect<T>(props: AriaHiddenSelectOptions, state: SelectState<T>, triggerRef: RefObject<FocusableElement | null>): HiddenSelectAria;
/**
 * Renders a hidden native `<select>` element, which can be used to support browser
 * form autofill, mobile form navigation, and native form submission.
 */
export function HiddenSelect<T>(props: HiddenSelectProps<T>): React.JSX.Element | null;
export type { AriaSelectProps } from '@react-types/select';

//# sourceMappingURL=types.d.ts.map
