import type { ElementType } from "react";
import type { CompositeContainerOptions } from "../composite/composite-container.tsx";
import type { Props } from "../utils/types.ts";
import type { ToolbarItemOptions } from "./toolbar-item.tsx";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `ToolbarContainer` component.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const store = useToolbarStore();
 * const props = useToolbarContainer({ store });
 * <Toolbar store={store}>
 *   <Role {...props}>
 *     <input type="text" />
 *   </Role>
 * </Toolbar>
 * ```
 */
export declare const useToolbarContainer: import("../utils/types.ts").Hook<"div", ToolbarContainerOptions<"div">>;
/**
 * Renders a toolbar item that may contain interactive widgets inside.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx {2-4}
 * <Toolbar>
 *   <ToolbarContainer>
 *     <input type="text" />
 *   </ToolbarContainer>
 * </Toolbar>
 * ```
 */
export declare const ToolbarContainer: (props: ToolbarContainerProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface ToolbarContainerOptions<T extends ElementType = TagName> extends ToolbarItemOptions<T>, Omit<CompositeContainerOptions<T>, "store"> {
}
export type ToolbarContainerProps<T extends ElementType = TagName> = Props<T, ToolbarContainerOptions<T>>;
export {};
