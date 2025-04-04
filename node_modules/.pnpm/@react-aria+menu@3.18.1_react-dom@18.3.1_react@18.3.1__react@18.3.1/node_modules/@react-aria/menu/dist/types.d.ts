import { AriaMenuProps, MenuTriggerType } from "@react-types/menu";
import { DOMAttributes, KeyboardDelegate, KeyboardEvents, RefObject, DOMProps, FocusableElement, FocusEvents, HoverEvents, Key, PressEvents, Node } from "@react-types/shared";
import { TreeState } from "@react-stately/tree";
import { AriaButtonProps } from "@react-types/button";
import { MenuTriggerState, SubmenuTriggerState } from "@react-stately/menu";
import { SelectionManager } from "@react-stately/selection";
import { ReactNode } from "react";
import { AriaPopoverProps, OverlayProps } from "@react-aria/overlays";
export interface MenuAria {
    /** Props for the menu element. */
    menuProps: DOMAttributes;
}
export interface AriaMenuOptions<T> extends Omit<AriaMenuProps<T>, 'children'>, KeyboardEvents {
    /** Whether the menu uses virtual scrolling. */
    isVirtualized?: boolean;
    /**
     * An optional keyboard delegate implementation for type to select,
     * to override the default.
     */
    keyboardDelegate?: KeyboardDelegate;
    /**
     * Whether the menu items should use virtual focus instead of being focused directly.
     */
    shouldUseVirtualFocus?: boolean;
}
/**
 * Provides the behavior and accessibility implementation for a menu component.
 * A menu displays a list of actions or options that a user can choose.
 * @param props - Props for the menu.
 * @param state - State for the menu, as returned by `useListState`.
 */
export function useMenu<T>(props: AriaMenuOptions<T>, state: TreeState<T>, ref: RefObject<HTMLElement | null>): MenuAria;
export interface AriaMenuTriggerProps {
    /** The type of menu that the menu trigger opens. */
    type?: 'menu' | 'listbox';
    /** Whether menu trigger is disabled. */
    isDisabled?: boolean;
    /** How menu is triggered. */
    trigger?: MenuTriggerType;
}
export interface MenuTriggerAria<T> {
    /** Props for the menu trigger element. */
    menuTriggerProps: AriaButtonProps;
    /** Props for the menu. */
    menuProps: AriaMenuOptions<T>;
}
/**
 * Provides the behavior and accessibility implementation for a menu trigger.
 * @param props - Props for the menu trigger.
 * @param state - State for the menu trigger.
 * @param ref - Ref to the HTML element trigger for the menu.
 */
export function useMenuTrigger<T>(props: AriaMenuTriggerProps, state: MenuTriggerState, ref: RefObject<Element | null>): MenuTriggerAria<T>;
export interface MenuItemAria {
    /** Props for the menu item element. */
    menuItemProps: DOMAttributes;
    /** Props for the main text element inside the menu item. */
    labelProps: DOMAttributes;
    /** Props for the description text element inside the menu item, if any. */
    descriptionProps: DOMAttributes;
    /** Props for the keyboard shortcut text element inside the item, if any. */
    keyboardShortcutProps: DOMAttributes;
    /** Whether the item is currently focused. */
    isFocused: boolean;
    /** Whether the item is keyboard focused. */
    isFocusVisible: boolean;
    /** Whether the item is currently selected. */
    isSelected: boolean;
    /** Whether the item is currently in a pressed state. */
    isPressed: boolean;
    /** Whether the item is disabled. */
    isDisabled: boolean;
}
export interface AriaMenuItemProps extends DOMProps, PressEvents, HoverEvents, KeyboardEvents, FocusEvents {
    /**
     * Whether the menu item is disabled.
     * @deprecated - pass disabledKeys to useTreeState instead.
     */
    isDisabled?: boolean;
    /**
     * Whether the menu item is selected.
     * @deprecated - pass selectedKeys to useTreeState instead.
     */
    isSelected?: boolean;
    /** A screen reader only label for the menu item. */
    'aria-label'?: string;
    /** The unique key for the menu item. */
    key: Key;
    /**
     * Handler that is called when the menu should close after selecting an item.
     * @deprecated - pass to the menu instead.
     */
    onClose?: () => void;
    /**
     * Whether the menu should close when the menu item is selected.
     * @default true
     */
    closeOnSelect?: boolean;
    /** Whether the menu item is contained in a virtual scrolling menu. */
    isVirtualized?: boolean;
    /**
     * Handler that is called when the user activates the item.
     * @deprecated - pass to the menu instead.
     */
    onAction?: (key: Key) => void;
    /** What kind of popup the item opens. */
    'aria-haspopup'?: 'menu' | 'dialog';
    /** Indicates whether the menu item's popup element is expanded or collapsed. */
    'aria-expanded'?: boolean | 'true' | 'false';
    /** Identifies the menu item's popup element whose contents or presence is controlled by the menu item. */
    'aria-controls'?: string;
    /** Override of the selection manager. By default, `state.selectionManager` is used. */
    selectionManager?: SelectionManager;
}
/**
 * Provides the behavior and accessibility implementation for an item in a menu.
 * See `useMenu` for more details about menus.
 * @param props - Props for the item.
 * @param state - State for the menu, as returned by `useTreeState`.
 */
export function useMenuItem<T>(props: AriaMenuItemProps, state: TreeState<T>, ref: RefObject<FocusableElement | null>): MenuItemAria;
export interface AriaMenuSectionProps {
    /** The heading for the section. */
    heading?: ReactNode;
    /** An accessibility label for the section. Required if `heading` is not present. */
    'aria-label'?: string;
}
export interface MenuSectionAria {
    /** Props for the wrapper list item. */
    itemProps: DOMAttributes;
    /** Props for the heading element, if any. */
    headingProps: DOMAttributes;
    /** Props for the group element. */
    groupProps: DOMAttributes;
}
/**
 * Provides the behavior and accessibility implementation for a section in a menu.
 * See `useMenu` for more details about menus.
 * @param props - Props for the section.
 */
export function useMenuSection(props: AriaMenuSectionProps): MenuSectionAria;
export interface AriaSubmenuTriggerProps {
    /**
     * An object representing the submenu trigger menu item. Contains all the relevant information that makes up the menu item.
     * @deprecated
     */
    node?: Node<unknown>;
    /** Whether the submenu trigger is disabled. */
    isDisabled?: boolean;
    /** The type of the contents that the submenu trigger opens. */
    type?: 'dialog' | 'menu';
    /** Ref of the menu that contains the submenu trigger. */
    parentMenuRef: RefObject<HTMLElement | null>;
    /** Ref of the submenu opened by the submenu trigger. */
    submenuRef: RefObject<HTMLElement | null>;
    /**
     * The delay time in milliseconds for the submenu to appear after hovering over the trigger.
     * @default 200
     */
    delay?: number;
    /** Whether the submenu trigger uses virtual focus. */
    shouldUseVirtualFocus?: boolean;
}
interface SubmenuTriggerProps extends Omit<AriaMenuItemProps, 'key'> {
    /** Whether the submenu trigger is in an expanded state. */
    isOpen: boolean;
}
interface SubmenuProps<T> extends AriaMenuOptions<T> {
    /** The level of the submenu. */
    submenuLevel: number;
}
export interface SubmenuTriggerAria<T> {
    /** Props for the submenu trigger menu item. */
    submenuTriggerProps: SubmenuTriggerProps;
    /** Props for the submenu controlled by the submenu trigger menu item. */
    submenuProps: SubmenuProps<T>;
    /** Props for the submenu's popover container. */
    popoverProps: Pick<AriaPopoverProps, 'isNonModal' | 'shouldCloseOnInteractOutside'> & Pick<OverlayProps, 'disableFocusManagement'>;
}
/**
 * Provides the behavior and accessibility implementation for a submenu trigger and its associated submenu.
 * @param props - Props for the submenu trigger and refs attach to its submenu and parent menu.
 * @param state - State for the submenu trigger.
 * @param ref - Ref to the submenu trigger element.
 */
export function useSubmenuTrigger<T>(props: AriaSubmenuTriggerProps, state: SubmenuTriggerState, ref: RefObject<FocusableElement | null>): SubmenuTriggerAria<T>;
export type { AriaMenuProps } from '@react-types/menu';

//# sourceMappingURL=types.d.ts.map
