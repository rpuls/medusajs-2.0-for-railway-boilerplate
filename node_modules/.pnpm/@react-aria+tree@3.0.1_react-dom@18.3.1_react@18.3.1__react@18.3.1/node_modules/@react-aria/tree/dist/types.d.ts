import { AriaGridListOptions, AriaGridListProps, GridListProps, AriaGridListItemOptions, GridListItemAria } from "@react-aria/gridlist";
import { DOMAttributes, KeyboardDelegate, RefObject, FocusableElement, Node } from "@react-types/shared";
import { TreeState } from "@react-stately/tree";
import { AriaButtonProps } from "@react-types/button";
export interface TreeProps<T> extends GridListProps<T> {
}
export interface AriaTreeProps<T> extends Omit<AriaGridListProps<T>, 'keyboardNavigationBehavior'> {
}
export interface AriaTreeOptions<T> extends Omit<AriaGridListOptions<T>, 'children' | 'shouldFocusWrap'> {
    /**
     * An optional keyboard delegate implementation for type to select,
     * to override the default.
     */
    keyboardDelegate?: KeyboardDelegate;
}
export interface TreeAria {
    /** Props for the treegrid element. */
    gridProps: DOMAttributes;
}
/**
 * Provides the behavior and accessibility implementation for a single column treegrid component with interactive children.
 * A tree grid provides users with a way to navigate nested hierarchical information.
 * @param props - Props for the treegrid.
 * @param state - State for the treegrid, as returned by `useTreeState`.
 * @param ref - The ref attached to the treegrid element.
 */
export function useTree<T>(props: AriaTreeOptions<T>, state: TreeState<T>, ref: RefObject<HTMLElement | null>): TreeAria;
export interface AriaTreeItemOptions extends Omit<AriaGridListItemOptions, 'isVirtualized'> {
    /** An object representing the treegrid item. Contains all the relevant information that makes up the treegrid row. */
    node: Node<unknown>;
}
export interface TreeItemAria extends GridListItemAria {
    /** Props for the tree grid row element. */
    rowProps: DOMAttributes;
    /** Props for the tree grid cell element within the tree grid list row. */
    gridCellProps: DOMAttributes;
    /** Props for the tree grid row description element, if any. */
    descriptionProps: DOMAttributes;
    /** Props for the tree grid row expand button. */
    expandButtonProps: AriaButtonProps;
}
/**
 * Provides the behavior and accessibility implementation for a row in a tree grid list.
 * @param props - Props for the row.
 * @param state - State of the parent list, as returned by `useTreeState`.
 * @param ref - The ref attached to the row element.
 */
export function useTreeItem<T>(props: AriaTreeItemOptions, state: TreeState<T>, ref: RefObject<FocusableElement | null>): TreeItemAria;

//# sourceMappingURL=types.d.ts.map
