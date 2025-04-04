import type { ReactNode } from "react";
import type { TabStoreProps } from "./tab-store.ts";
/**
 * Provides a tab store to [Tab](https://ariakit.org/components/tab) components.
 * @see https://ariakit.org/components/tab
 * @example
 * ```jsx
 * <TabProvider>
 *   <TabList>
 *     <Tab>For You</Tab>
 *     <Tab>Following</Tab>
 *   </TabList>
 *   <TabPanel>For You</TabPanel>
 *   <TabPanel>Following</TabPanel>
 * </TabProvider>
 * ```
 */
export declare function TabProvider(props?: TabProviderProps): import("react/jsx-runtime").JSX.Element;
export interface TabProviderProps extends TabStoreProps {
    children?: ReactNode;
}
