import type { ElementType } from "react";
import type { CompositeItemOptions } from "../composite/composite-item.tsx";
import type { Props } from "../utils/types.ts";
import type { TabStore } from "./tab-store.ts";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `Tab` component.
 * @see https://ariakit.org/components/tab
 * @example
 * ```jsx
 * const store = useTabStore();
 * const props = useTab({ store });
 * <TabList store={store}>
 *   <Role {...props}>Tab 1</Role>
 * </TabList>
 * <TabPanel store={store}>Panel 1</TabPanel>
 * ```
 */
export declare const useTab: import("../utils/types.ts").Hook<"button", TabOptions<"button">>;
/**
 * Renders a tab element inside a
 * [`TabList`](https://ariakit.org/reference/tab-list) wrapper.
 * @see https://ariakit.org/components/tab
 * @example
 * ```jsx {3,4}
 * <TabProvider>
 *   <TabList>
 *     <Tab>Tab 1</Tab>
 *     <Tab>Tab 2</Tab>
 *   </TabList>
 *   <TabPanel>Panel 1</TabPanel>
 *   <TabPanel>Panel 2</TabPanel>
 * </TabProvider>
 * ```
 */
export declare const Tab: (props: TabProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface TabOptions<T extends ElementType = TagName> extends CompositeItemOptions<T> {
    /**
     * Object returned by the
     * [`useTabStore`](https://ariakit.org/reference/use-tab-store) hook. If not
     * provided, the closest [`TabList`](https://ariakit.org/reference/tab-list)
     * component's context will be used.
     */
    store?: TabStore;
    /**
     * @default true
     */
    accessibleWhenDisabled?: CompositeItemOptions["accessibleWhenDisabled"];
}
export type TabProps<T extends ElementType = TagName> = Props<T, TabOptions<T>>;
export {};
