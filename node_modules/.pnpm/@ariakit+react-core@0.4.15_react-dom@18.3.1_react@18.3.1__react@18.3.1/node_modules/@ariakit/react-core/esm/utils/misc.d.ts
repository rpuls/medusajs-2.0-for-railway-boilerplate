import type { HTMLAttributes, MutableRefObject, ReactElement, Ref, RefCallback } from "react";
/**
 * Sets both a function and object React ref.
 */
export declare function setRef<T>(ref: RefCallback<T> | MutableRefObject<T> | null | undefined, value: T): void;
/**
 * Checks if an element is a valid React element with a ref.
 */
export declare function isValidElementWithRef<P extends {
    ref?: Ref<any>;
}>(element: unknown): element is ReactElement<P> & {
    ref?: Ref<any>;
};
/**
 * Gets the ref property from a React element.
 */
export declare function getRefProperty(element: unknown): Ref<any> | undefined;
/**
 * Merges two sets of props.
 */
export declare function mergeProps<T extends HTMLAttributes<any>>(base: T, overrides: T): T;
