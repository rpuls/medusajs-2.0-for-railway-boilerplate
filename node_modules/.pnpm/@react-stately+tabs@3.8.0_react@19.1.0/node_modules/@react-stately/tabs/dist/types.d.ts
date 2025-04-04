import { CollectionStateBase } from "@react-types/shared";
import { SingleSelectListState } from "@react-stately/list";
import { TabListProps } from "@react-types/tabs";
export interface TabListStateOptions<T> extends Omit<TabListProps<T>, 'children'>, CollectionStateBase<T> {
}
export interface TabListState<T> extends SingleSelectListState<T> {
    /** Whether the tab list is disabled. */
    isDisabled: boolean;
}
/**
 * Provides state management for a Tabs component. Tabs include a TabList which tracks
 * which tab is currently selected and displays the content associated with that Tab in a TabPanel.
 */
export function useTabListState<T extends object>(props: TabListStateOptions<T>): TabListState<T>;
export type { TabListProps } from '@react-types/tabs';

//# sourceMappingURL=types.d.ts.map
