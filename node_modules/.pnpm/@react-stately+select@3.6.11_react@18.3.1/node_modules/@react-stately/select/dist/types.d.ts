import { CollectionStateBase, FocusStrategy } from "@react-types/shared";
import { FormValidationState } from "@react-stately/form";
import { OverlayTriggerState } from "@react-stately/overlays";
import { SelectProps } from "@react-types/select";
import { SingleSelectListState } from "@react-stately/list";
export interface SelectStateOptions<T> extends Omit<SelectProps<T>, 'children'>, CollectionStateBase<T> {
}
export interface SelectState<T> extends SingleSelectListState<T>, OverlayTriggerState, FormValidationState {
    /** Whether the select is currently focused. */
    readonly isFocused: boolean;
    /** Sets whether the select is focused. */
    setFocused(isFocused: boolean): void;
    /** Controls which item will be auto focused when the menu opens. */
    readonly focusStrategy: FocusStrategy | null;
    /** Opens the menu. */
    open(focusStrategy?: FocusStrategy | null): void;
    /** Toggles the menu. */
    toggle(focusStrategy?: FocusStrategy | null): void;
}
/**
 * Provides state management for a select component. Handles building a collection
 * of items from props, handles the open state for the popup menu, and manages
 * multiple selection state.
 */
export function useSelectState<T extends object>(props: SelectStateOptions<T>): SelectState<T>;
export type { SelectProps } from '@react-types/select';

//# sourceMappingURL=types.d.ts.map
