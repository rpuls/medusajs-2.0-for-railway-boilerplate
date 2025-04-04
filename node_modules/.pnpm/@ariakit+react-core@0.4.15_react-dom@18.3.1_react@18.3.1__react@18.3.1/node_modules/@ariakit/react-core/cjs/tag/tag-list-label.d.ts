import type { ElementType } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import type { Props } from "../utils/types.ts";
import type { TagStore } from "./tag-store.ts";
declare const TagName = "label";
type TagName = typeof TagName;
/**
 * Returns props to create a `TagListLabel` component.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx
 * const props = useTagListLabel();
 * <Role.label {...props} />
 * ```
 */
export declare const useTagListLabel: import("../utils/types.ts").Hook<"label", TagListLabelOptions<"label">>;
/**
 * Renders a label element for the
 * [`TagInput`](https://ariakit.org/reference/tag-input) and also acts as the
 * accessible name for the listbox element rendered by
 * [`TagList`](https://ariakit.org/reference/tag-list).
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx {2}
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
export declare const TagListLabel: (props: TagListLabelProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface TagListLabelOptions<T extends ElementType = TagName> extends CompositeOptions<T> {
    /**
     * Object returned by the
     * [`useTagStore`](https://ariakit.org/reference/use-tag-store) hook. If not
     * provided, the closest
     * [`TagProvider`](https://ariakit.org/reference/tag-provider) component's
     * context will be used.
     */
    store?: TagStore;
}
export type TagListLabelProps<T extends ElementType = TagName> = Props<T, TagListLabelOptions<T>>;
export {};
