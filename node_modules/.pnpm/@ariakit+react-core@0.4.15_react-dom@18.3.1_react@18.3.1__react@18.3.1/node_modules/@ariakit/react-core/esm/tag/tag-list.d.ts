import type { ElementType } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import type { Props } from "../utils/types.ts";
import type { TagStore } from "./tag-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `TagList` component.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx
 * const props = useTagList();
 * <Role.div {...props} />
 * ```
 */
export declare const useTagList: import("../utils/types.ts").Hook<"div", TagListOptions<"div">>;
/**
 * Renders a wrapper for [`Tag`](https://ariakit.org/reference/tag) and
 * [`TagInput`](https://ariakit.org/reference/tag-input) components. This
 * component is typically styled as an input field.
 *
 * The [`TagListLabel`](https://ariakit.org/reference/tag-list-label) component
 * can be used to provide an accessible name for the listbox element that owns
 * the tags.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx {3-15}
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
export declare const TagList: (props: TagListProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface TagListOptions<T extends ElementType = TagName> extends CompositeOptions<T> {
    /**
     * Object returned by the
     * [`useTagStore`](https://ariakit.org/reference/use-tag-store) hook. If not
     * provided, the closest
     * [`TagProvider`](https://ariakit.org/reference/tag-provider) component's
     * context will be used.
     */
    store?: TagStore;
}
export type TagListProps<T extends ElementType = TagName> = Props<T, TagListOptions<T>>;
export {};
