import { AriaLinkProps } from "@react-types/link";
import { DOMAttributes, FocusableElement, RefObject } from "@react-types/shared";
export interface AriaLinkOptions extends AriaLinkProps {
    /** Whether the link is disabled. */
    isDisabled?: boolean;
    /**
     * The HTML element used to render the link, e.g. 'a', or 'span'.
     * @default 'a'
     */
    elementType?: string;
}
export interface LinkAria {
    /** Props for the link element. */
    linkProps: DOMAttributes;
    /** Whether the link is currently pressed. */
    isPressed: boolean;
}
/**
 * Provides the behavior and accessibility implementation for a link component.
 * A link allows a user to navigate to another page or resource within a web page
 * or application.
 */
export function useLink(props: AriaLinkOptions, ref: RefObject<FocusableElement | null>): LinkAria;

//# sourceMappingURL=types.d.ts.map
