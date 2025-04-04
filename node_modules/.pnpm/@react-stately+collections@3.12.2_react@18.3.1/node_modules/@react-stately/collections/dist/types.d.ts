import { Key, ItemProps, SectionProps, CollectionBase, Node, Collection, CollectionStateBase } from "@react-types/shared";
import { ReactElement, ReactNode, JSX } from "react";
export interface PartialNode<T> {
    type?: string;
    key?: Key | null;
    value?: T;
    element?: ReactElement | null;
    wrapper?: (element: ReactElement) => ReactElement;
    rendered?: ReactNode;
    textValue?: string;
    'aria-label'?: string;
    index?: number;
    renderer?: (item: T) => ReactElement | null;
    hasChildNodes?: boolean;
    childNodes?: () => IterableIterator<PartialNode<T>>;
    props?: any;
    shouldInvalidate?: (context: any) => boolean;
}
export let Item: <T>(props: ItemProps<T>) => JSX.Element;
export let Section: <T>(props: SectionProps<T>) => JSX.Element;
export class CollectionBuilder<T extends object> {
    build(props: Partial<CollectionBase<T>>, context?: unknown): Iterable<Node<T>>;
}
interface CollectionOptions<T, C extends Collection<Node<T>>> extends Omit<CollectionStateBase<T, C>, 'children'> {
    children?: ReactElement<any> | null | (ReactElement<any> | null)[] | ((item: T) => ReactElement<any> | null);
}
type CollectionFactory<T, C extends Collection<Node<T>>> = (node: Iterable<Node<T>>) => C;
export function useCollection<T extends object, C extends Collection<Node<T>> = Collection<Node<T>>>(props: CollectionOptions<T, C>, factory: CollectionFactory<T, C>, context?: unknown): C;
export function getChildNodes<T>(node: Node<T>, collection: Collection<Node<T>>): Iterable<Node<T>>;
export function getFirstItem<T>(iterable: Iterable<T>): T | undefined;
export function getNthItem<T>(iterable: Iterable<T>, index: number): T | undefined;
export function getLastItem<T>(iterable: Iterable<T>): T | undefined;
export function compareNodeOrder<T>(collection: Collection<Node<T>>, a: Node<T>, b: Node<T>): number;
export function getItemCount<T>(collection: Collection<Node<T>>): number;

//# sourceMappingURL=types.d.ts.map
