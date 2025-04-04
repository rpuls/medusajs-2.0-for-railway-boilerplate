import type { ReactNode } from "react";
import type { TagStoreProps } from "./tag-store.ts";
/**
 * Provides a tag store to [Tag](https://ariakit.org/components/tag) components.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx
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
export declare function TagProvider(props?: TagProviderProps): import("react/jsx-runtime").JSX.Element;
export interface TagProviderProps extends TagStoreProps {
    children?: ReactNode;
}
