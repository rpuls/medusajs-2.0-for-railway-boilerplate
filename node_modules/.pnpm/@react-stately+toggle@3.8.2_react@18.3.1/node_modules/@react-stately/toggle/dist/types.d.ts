import { ToggleStateOptions } from "@react-types/checkbox";
import { Key } from "@react-types/shared";
export { ToggleStateOptions };
export interface ToggleState {
    /** Whether the toggle is selected. */
    readonly isSelected: boolean;
    /** Updates selection state. */
    setSelected(isSelected: boolean): void;
    /** Toggle the selection state. */
    toggle(): void;
}
/**
 * Provides state management for toggle components like checkboxes and switches.
 */
export function useToggleState(props?: ToggleStateOptions): ToggleState;
export interface ToggleGroupProps {
    /** Whether single or multiple selection is enabled. */
    selectionMode?: 'single' | 'multiple';
    /** Whether the collection allows empty selection. */
    disallowEmptySelection?: boolean;
    /** The currently selected keys in the collection (controlled). */
    selectedKeys?: Iterable<Key>;
    /** The initial selected keys in the collection (uncontrolled). */
    defaultSelectedKeys?: Iterable<Key>;
    /** Handler that is called when the selection changes. */
    onSelectionChange?: (keys: Set<Key>) => void;
    /** Whether all items are disabled. */
    isDisabled?: boolean;
}
export interface ToggleGroupState {
    /** Whether single or multiple selection is enabled. */
    readonly selectionMode: 'single' | 'multiple';
    /** Whether all items are disabled. */
    readonly isDisabled: boolean;
    /** A set of keys for items that are selected. */
    readonly selectedKeys: Set<Key>;
    /** Toggles the selected state for an item by its key. */
    toggleKey(key: Key): void;
    /** Sets whether the given key is selected. */
    setSelected(key: Key, isSelected: boolean): void;
    /** Replaces the set of selected keys. */
    setSelectedKeys(keys: Set<Key>): void;
}
/**
 * Manages state for a group of toggles.
 * It supports both single and multiple selected items.
 */
export function useToggleGroupState(props: ToggleGroupProps): ToggleGroupState;
export type { ToggleProps } from '@react-types/checkbox';

//# sourceMappingURL=types.d.ts.map
