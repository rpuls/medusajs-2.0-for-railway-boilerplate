import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { ElementType, MouseEvent } from "react";
import type { Options, Props } from "../utils/types.ts";
import type { TagStore } from "./tag-store.ts";
declare const TagName = "button";
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];
/**
 * Returns props to create a `TagRemove` component.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx
 * const props = useTagRemove();
 * <Role.button {...props} />
 * ```
 */
export declare const useTagRemove: import("../utils/types.ts").Hook<"button", TagRemoveOptions<"button">>;
/**
 * Renders a `Backspace` icon inside a
 * [`Tag`](https://ariakit.org/reference/tag) component that removes the tag
 * when clicked with a mouse.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx {9}
 * <TagProvider>
 *   <TagListLabel>Invitees</TagListLabel>
 *   <TagList>
 *     <TagValues>
 *       {(values) =>
 *         values.map((value) => (
 *           <Tag key={value} value={value}>
 *             {value}
 *             <TagRemove />
 *           </Tag>
 *         ))
 *       }
 *     </TagValues>
 *     <TagInput />
 *   </TagList>
 * </TagProvider>
 * ```
 */
export declare const TagRemove: (props: TagRemoveProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface TagRemoveOptions<_T extends ElementType = TagName> extends Options {
    /**
     * Object returned by the
     * [`useTagStore`](https://ariakit.org/reference/use-tag-store) hook. If not
     * provided, the closest
     * [`TagProvider`](https://ariakit.org/reference/tag-provider) component's
     * context will be used.
     */
    store?: TagStore;
    /**
     * The value of the tag to remove. If not provided, the value will be inferred
     * from the parent [`Tag`](https://ariakit.org/reference/tag) component.
     */
    value?: string;
    /**
     * Determines if the tag should be removed when clicked with a mouse. If a
     * function is provided, it will be called with the click event and should
     * return a boolean.
     * @default true
     */
    removeOnClick?: BooleanOrCallback<MouseEvent<HTMLType>>;
}
export type TagRemoveProps<T extends ElementType = TagName> = Props<T, TagRemoveOptions<T>>;
export {};
