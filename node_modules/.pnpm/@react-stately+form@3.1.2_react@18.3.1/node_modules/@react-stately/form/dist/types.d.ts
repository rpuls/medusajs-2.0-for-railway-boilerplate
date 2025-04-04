import { Validation, ValidationErrors, ValidationResult } from "@react-types/shared";
import { Context } from "react";
export const VALID_VALIDITY_STATE: ValidityState;
export const DEFAULT_VALIDATION_RESULT: ValidationResult;
export const FormValidationContext: Context<ValidationErrors>;
export const privateValidationStateProp: string;
interface FormValidationProps<T> extends Validation<T> {
    builtinValidation?: ValidationResult;
    name?: string | string[];
    value: T | null;
}
export interface FormValidationState {
    /** Realtime validation results, updated as the user edits the value. */
    realtimeValidation: ValidationResult;
    /** Currently displayed validation results, updated when the user commits their changes. */
    displayValidation: ValidationResult;
    /** Updates the current validation result. Not displayed to the user until `commitValidation` is called. */
    updateValidation(result: ValidationResult): void;
    /** Resets the displayed validation state to valid when the user resets the form. */
    resetValidation(): void;
    /** Commits the realtime validation so it is displayed to the user. */
    commitValidation(): void;
}
export function useFormValidationState<T>(props: FormValidationProps<T>): FormValidationState;
export function mergeValidation(...results: ValidationResult[]): ValidationResult;

//# sourceMappingURL=types.d.ts.map
