import type { ElementType } from "react";
import type { Props } from "../utils/types.ts";
import type { ToolbarItemOptions } from "./toolbar-item.tsx";
declare const TagName = "input";
type TagName = typeof TagName;
/**
 * Returns props to create a `ToolbarInput` component.
 * @see https://ariakit.org/components/toolbar
 * @deprecated Use `useToolbarItem` instead.
 * @example
 * ```jsx
 * const store = useToolbarStore();
 * const props = useToolbarInput({ store });
 * <Toolbar store={store}>
 *   <Role {...props} />
 * </Toolbar>
 * ```
 */
export declare const useToolbarInput: import("../utils/types.ts").Hook<"input", ToolbarInputOptions<"input">>;
/**
 * Renders a text input as a toolbar item, maintaining arrow key navigation on
 * the toolbar.
 * @see https://ariakit.org/components/toolbar
 * @deprecated Use `<ToolbarItem render={<input />}>` instead.
 * @example
 * ```jsx {2}
 * <Toolbar>
 *   <ToolbarInput />
 * </Toolbar>
 * ```
 */
export declare const ToolbarInput: (props: ToolbarInputProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface ToolbarInputOptions<T extends ElementType = TagName> extends ToolbarItemOptions<T> {
}
export type ToolbarInputProps<T extends ElementType = TagName> = Props<T, ToolbarInputOptions<T>>;
export {};
