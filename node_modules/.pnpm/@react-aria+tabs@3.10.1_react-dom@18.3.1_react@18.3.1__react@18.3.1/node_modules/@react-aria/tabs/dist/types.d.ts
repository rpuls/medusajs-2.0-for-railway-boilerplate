import { AriaTabProps, AriaTabPanelProps, AriaTabListProps } from "@react-types/tabs";
import { DOMAttributes, FocusableElement, RefObject } from "@react-types/shared";
import { TabListState } from "@react-stately/tabs";
export interface TabAria {
    /** Props for the tab element. */
    tabProps: DOMAttributes;
    /** Whether the tab is currently selected. */
    isSelected: boolean;
    /** Whether the tab is disabled. */
    isDisabled: boolean;
    /** Whether the tab is currently in a pressed state. */
    isPressed: boolean;
}
/**
 * Provides the behavior and accessibility implementation for a tab.
 * When selected, the associated tab panel is shown.
 */
export function useTab<T>(props: AriaTabProps, state: TabListState<T>, ref: RefObject<FocusableElement | null>): TabAria;
export interface TabPanelAria {
    /** Props for the tab panel element. */
    tabPanelProps: DOMAttributes;
}
/**
 * Provides the behavior and accessibility implementation for a tab panel. A tab panel is a container for
 * the contents of a tab, and is shown when the tab is selected.
 */
export function useTabPanel<T>(props: AriaTabPanelProps, state: TabListState<T> | null, ref: RefObject<Element | null>): TabPanelAria;
export interface AriaTabListOptions<T> extends Omit<AriaTabListProps<T>, 'children'> {
}
export interface TabListAria {
    /** Props for the tablist container. */
    tabListProps: DOMAttributes;
}
/**
 * Provides the behavior and accessibility implementation for a tab list.
 * Tabs organize content into multiple sections and allow users to navigate between them.
 */
export function useTabList<T>(props: AriaTabListOptions<T>, state: TabListState<T>, ref: RefObject<HTMLElement | null>): TabListAria;
export type { AriaTabListProps, AriaTabPanelProps, AriaTabProps } from '@react-types/tabs';
export type { Orientation } from '@react-types/shared';

//# sourceMappingURL=types.d.ts.map
