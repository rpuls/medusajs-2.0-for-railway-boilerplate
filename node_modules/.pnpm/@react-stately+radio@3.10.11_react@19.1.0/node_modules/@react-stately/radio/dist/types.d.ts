import { FormValidationState } from "@react-stately/form";
import { RadioGroupProps } from "@react-types/radio";
import { ValidationState } from "@react-types/shared";
export interface RadioGroupState extends FormValidationState {
    /**
     * The name for the group, used for native form submission.
     * @deprecated
     * @private
     */
    readonly name: string;
    /** Whether the radio group is disabled. */
    readonly isDisabled: boolean;
    /** Whether the radio group is read only. */
    readonly isReadOnly: boolean;
    /** Whether the radio group is required. */
    readonly isRequired: boolean;
    /**
     * Whether the radio group is valid or invalid.
     * @deprecated Use `isInvalid` instead.
     */
    readonly validationState: ValidationState | null;
    /** Whether the radio group is invalid. */
    readonly isInvalid: boolean;
    /** The currently selected value. */
    readonly selectedValue: string | null;
    /** Sets the selected value. */
    setSelectedValue(value: string | null): void;
    /** The value of the last focused radio. */
    readonly lastFocusedValue: string | null;
    /** Sets the last focused value. */
    setLastFocusedValue(value: string | null): void;
}
/**
 * Provides state management for a radio group component. Provides a name for the group,
 * and manages selection and focus state.
 */
export function useRadioGroupState(props: RadioGroupProps): RadioGroupState;
export type { RadioGroupProps } from '@react-types/radio';

//# sourceMappingURL=types.d.ts.map
