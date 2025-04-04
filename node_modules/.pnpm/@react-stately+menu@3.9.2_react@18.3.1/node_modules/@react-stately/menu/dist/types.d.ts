import { FocusStrategy, Key } from "@react-types/shared";
import { MenuTriggerProps } from "@react-types/menu";
import { OverlayTriggerState } from "@react-stately/overlays";
export interface MenuTriggerState extends OverlayTriggerState {
    /** Controls which item will be auto focused when the menu opens. */
    readonly focusStrategy: FocusStrategy | null;
    /** Opens the menu. */
    open(focusStrategy?: FocusStrategy | null): void;
    /** Toggles the menu. */
    toggle(focusStrategy?: FocusStrategy | null): void;
}
export interface RootMenuTriggerState extends MenuTriggerState {
    /** Opens a specific submenu tied to a specific menu item at a specific level. */
    openSubmenu: (triggerKey: Key, level: number) => void;
    /** Closes a specific submenu tied to a specific menu item at a specific level. */
    closeSubmenu: (triggerKey: Key, level: number) => void;
    /** An array of open submenu trigger keys within the menu tree.
     * The index of key within array matches the submenu level in the tree.
     */
    expandedKeysStack: Key[];
    /** Closes the menu and all submenus in the menu tree. */
    close: () => void;
}
/**
 * Manages state for a menu trigger. Tracks whether the menu is currently open,
 * and controls which item will receive focus when it opens. Also tracks the open submenus within
 * the menu tree via their trigger keys.
 */
export function useMenuTriggerState(props: MenuTriggerProps): RootMenuTriggerState;
export interface SubmenuTriggerProps {
    /** Key of the trigger item. */
    triggerKey: Key;
}
export interface SubmenuTriggerState extends OverlayTriggerState {
    /** Whether the submenu is currently open. */
    isOpen: boolean;
    /** Controls which item will be auto focused when the submenu opens. */
    focusStrategy: FocusStrategy | null;
    /** Opens the submenu. */
    open: (focusStrategy?: FocusStrategy | null) => void;
    /** Closes the submenu. */
    close: () => void;
    /** Closes all menus and submenus in the menu tree. */
    closeAll: () => void;
    /** The level of the submenu. */
    submenuLevel: number;
    /** Toggles the submenu. */
    toggle: (focusStrategy?: FocusStrategy | null) => void;
    /** @private */
    setOpen: () => void;
}
/**
 * Manages state for a submenu trigger. Tracks whether the submenu is currently open, the level of the submenu, and
 * controls which item will receive focus when it opens.
 */
export function useSubmenuTriggerState(props: SubmenuTriggerProps, state: RootMenuTriggerState): SubmenuTriggerState;
export type { MenuTriggerProps } from '@react-types/menu';

//# sourceMappingURL=types.d.ts.map
