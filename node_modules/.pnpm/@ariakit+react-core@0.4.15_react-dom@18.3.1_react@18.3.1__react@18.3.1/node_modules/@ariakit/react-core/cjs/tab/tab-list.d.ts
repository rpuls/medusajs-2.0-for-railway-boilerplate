import type { ElementType } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import type { Props } from "../utils/types.ts";
import type { TabStore } from "./tab-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `TabList` component.
 * @see https://ariakit.org/components/tab
 * @example
 * ```jsx
 * const store = useTabStore();
 * const props = useTabList({ store });
 * <Role {...props}>
 *   <Tab>Tab 1</Tab>
 *   <Tab>Tab 2</Tab>
 * </Role>
 * <TabPanel store={store}>Panel 1</TabPanel>
 * <TabPanel store={store}>Panel 2</TabPanel>
 * ```
 */
export declare const useTabList: import("../utils/types.ts").Hook<"div", TabListOptions<"div">>;
/**
 * Renders a composite tab list wrapper for
 * [`Tab`](https://ariakit.org/reference/tab) elements.
 * @see https://ariakit.org/components/tab
 * @example
 * ```jsx {2-5}
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
export declare const TabList: (props: TabListProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface TabListOptions<T extends ElementType = TagName> extends CompositeOptions<T> {
    /**
     * Object returned by the
     * [`useTabStore`](https://ariakit.org/reference/use-tab-store) hook. If not
     * provided, the closest
     * [`TabProvider`](https://ariakit.org/reference/tab-provider) component's
     * context will be used.
     */
    store?: TabStore;
}
export type TabListProps<T extends ElementType = TagName> = Props<T, TabListOptions<T>>;
export {};
