import { AriaBreadcrumbItemProps, AriaBreadcrumbsProps } from "@react-types/breadcrumbs";
import { DOMAttributes, FocusableElement, RefObject } from "@react-types/shared";
export interface BreadcrumbItemAria {
    /** Props for the breadcrumb item link element. */
    itemProps: DOMAttributes;
}
/**
 * Provides the behavior and accessibility implementation for an in a breadcrumbs component.
 * See `useBreadcrumbs` for details about breadcrumbs.
 */
export function useBreadcrumbItem(props: AriaBreadcrumbItemProps, ref: RefObject<FocusableElement | null>): BreadcrumbItemAria;
export interface BreadcrumbsAria {
    /** Props for the breadcrumbs navigation element. */
    navProps: DOMAttributes;
}
/**
 * Provides the behavior and accessibility implementation for a breadcrumbs component.
 * Breadcrumbs display a hierarchy of links to the current page or resource in an application.
 */
export function useBreadcrumbs(props: AriaBreadcrumbsProps): BreadcrumbsAria;
export type { AriaBreadcrumbItemProps, AriaBreadcrumbsProps } from '@react-types/breadcrumbs';

//# sourceMappingURL=types.d.ts.map
