import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { ElementType, KeyboardEvent } from "react";
import type { CompositeItemOptions } from "../composite/composite-item.tsx";
import type { Props } from "../utils/types.ts";
import type { TagStore } from "./tag-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];
/**
 * Returns props to create a `Tag` component.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx
 * const props = useTag();
 * <Role.div {...props} />
 * ```
 */
export declare const useTag: import("../utils/types.ts").Hook<"div", TagOptions<"div">>;
/**
 * Renders a tag element inside a
 * [`TagList`](https://ariakit.org/reference/tag-list) wrapper.
 *
 * The user can remove the tag by pressing `Backspace` or `Delete` keys when the
 * tag is focused. The
 * [`removeOnKeyPress`](https://ariakit.org/reference/tag#removeonkeypress) prop
 * can be used to disable this behavior.
 *
 * When a printable key is pressed, the focus is automatically moved to the
 * input element.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx {7-10}
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
export declare const Tag: (props: TagProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface TagOptions<T extends ElementType = TagName> extends CompositeItemOptions<T> {
    /**
     * Object returned by the
     * [`useTagStore`](https://ariakit.org/reference/use-tag-store) hook. If not
     * provided, the closest [`TagList`](https://ariakit.org/reference/tag-list)
     * component's context will be used.
     */
    store?: TagStore;
    /**
     * The unique value of the tag. This is automatically rendered as the tag's
     * content if no children are provided.
     */
    value: string;
    /**
     * Defines the behavior of the `Backspace` and `Delete` keys when the tag is
     * focused. If `true`, the tag is removed. If it's a function, it's invoked
     * with the key event and should return a boolean.
     * @default true
     */
    removeOnKeyPress?: BooleanOrCallback<KeyboardEvent<HTMLType>>;
}
export type TagProps<T extends ElementType = TagName> = Props<T, TagOptions<T>>;
export {};
