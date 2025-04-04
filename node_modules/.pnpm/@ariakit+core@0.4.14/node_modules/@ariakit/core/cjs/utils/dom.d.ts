import type { AriaHasPopup, AriaRole } from "./types.ts";
/**
 * It's `true` if it is running in a browser environment or `false` if it is not
 * (SSR).
 * @example
 * const title = canUseDOM ? document.title : "";
 */
export declare const canUseDOM: boolean;
/**
 * Returns `element.ownerDocument || document`.
 */
export declare function getDocument(node?: Window | Document | Node | null): Document;
/**
 * Returns `element.ownerDocument.defaultView || window`.
 */
export declare function getWindow(node?: Window | Document | Node | null): Window;
/**
 * Returns `element.ownerDocument.activeElement`.
 */
export declare function getActiveElement(node?: Node | null, activeDescendant?: boolean): HTMLElement | null;
/**
 * Similar to `Element.prototype.contains`, but a little bit faster when
 * `element` is the same as `child`.
 * @example
 * contains(
 *   document.getElementById("parent"),
 *   document.getElementById("child")
 * );
 */
export declare function contains(parent: Node, child: Node): boolean;
/**
 * Checks whether `element` is a frame element.
 */
export declare function isFrame(element: Element): element is HTMLIFrameElement;
/**
 * Checks whether `element` is a native HTML button element.
 * @example
 * isButton(document.querySelector("button")); // true
 * isButton(document.querySelector("input[type='button']")); // true
 * isButton(document.querySelector("div")); // false
 * isButton(document.querySelector("input[type='text']")); // false
 * isButton(document.querySelector("div[role='button']")); // false
 */
export declare function isButton(element: {
    tagName: string;
    type?: string;
}): boolean;
/**
 * Checks if the element is visible or not.
 */
export declare function isVisible(element: Element): boolean;
/**
 * Check whether the given element is a text field, where text field is defined
 * by the ability to select within the input.
 * @example
 * isTextField(document.querySelector("div")); // false
 * isTextField(document.querySelector("input")); // true
 * isTextField(document.querySelector("input[type='button']")); // false
 * isTextField(document.querySelector("textarea")); // true
 */
export declare function isTextField(element: Element): element is HTMLInputElement | HTMLTextAreaElement;
/**
 * Check whether the given element is a text field or a content editable
 * element.
 */
export declare function isTextbox(element: HTMLElement): boolean;
/**
 * Returns the value of the text field or content editable element as a string.
 */
export declare function getTextboxValue(element: HTMLElement): string;
/**
 * Returns the start and end offsets of the selection in the element.
 */
export declare function getTextboxSelection(element: HTMLElement): {
    start: number;
    end: number;
};
/**
 * Returns the element's role attribute, if it has one.
 */
export declare function getPopupRole(element?: Element | null, fallback?: AriaHasPopup): AriaHasPopup;
/**
 * Returns the item role attribute based on the popup's role.
 */
export declare function getPopupItemRole(element?: Element | null, fallback?: AriaRole): string | undefined;
/**
 * Calls `element.scrollIntoView()` if the element is hidden or partly hidden in
 * the viewport.
 */
export declare function scrollIntoViewIfNeeded(element: Element, arg?: boolean | ScrollIntoViewOptions): void;
/**
 * Returns the scrolling container element of a given element.
 */
export declare function getScrollingElement(element?: Element | null): HTMLElement | Element | null;
/**
 * Determines whether an element is hidden or partially hidden in the viewport.
 */
export declare function isPartiallyHidden(element: Element): boolean;
/**
 * SelectionRange only works on a few types of input. Calling
 * `setSelectionRange` on a unsupported input type may throw an error on certain
 * browsers. To avoid it, we check if its type supports SelectionRange first. It
 * will be a noop to non-supported types until we find a workaround.
 *
 * @see
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange
 */
export declare function setSelectionRange(element: HTMLInputElement | HTMLTextAreaElement, ...args: Parameters<typeof HTMLInputElement.prototype.setSelectionRange>): void;
/**
 * Sort the items based on their DOM position.
 */
export declare function sortBasedOnDOMPosition<T>(items: T[], getElement: (item: T) => Element | null | undefined): T[];
