import { Dialog as RadixDialog } from "radix-ui";
import * as React from "react";
interface DrawerRootProps extends React.ComponentPropsWithoutRef<typeof RadixDialog.Root> {
}
interface DrawerTriggerProps extends React.ComponentPropsWithoutRef<typeof RadixDialog.Trigger> {
}
interface DrawerCloseProps extends React.ComponentPropsWithoutRef<typeof RadixDialog.Close> {
}
interface DrawerPortalProps extends RadixDialog.DialogPortalProps {
}
/**
 * The `Drawer.Content` component uses this component to wrap the drawer content.
 * It accepts props from the [Radix UI Dialog Portal](https://www.radix-ui.com/primitives/docs/components/dialog#portal) component.
 */
declare const DrawerPortal: {
    (props: DrawerPortalProps): React.JSX.Element;
    displayName: string;
};
interface DrawerOverlayProps extends React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay> {
}
/**
 * This component is used to create the overlay for the drawer.
 * It accepts props from the [Radix UI Dialog Overlay](https://www.radix-ui.com/primitives/docs/components/dialog#overlay) component.
 */
declare const DrawerOverlay: React.ForwardRefExoticComponent<DrawerOverlayProps & React.RefAttributes<HTMLDivElement>>;
interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof RadixDialog.Content> {
    /**
     * Props for the overlay component.
     * It accepts props from the [Radix UI Dialog Overlay](https://www.radix-ui.com/primitives/docs/components/dialog#overlay) component.
    */
    overlayProps?: React.ComponentPropsWithoutRef<typeof DrawerOverlay>;
    /**
     * Props for the portal component that wraps the drawer content.
     * It accepts props from the [Radix UI Dialog Portal](https://www.radix-ui.com/primitives/docs/components/dialog#portal) component.
     */
    portalProps?: React.ComponentPropsWithoutRef<typeof DrawerPortal>;
}
interface DrawerHeaderProps extends React.ComponentPropsWithoutRef<"div"> {
}
interface DrawerBodyProps extends React.ComponentPropsWithoutRef<"div"> {
}
interface DrawerFooterProps extends React.HTMLAttributes<HTMLDivElement> {
}
interface DrawerDescriptionProps extends React.ComponentPropsWithoutRef<typeof RadixDialog.Description> {
}
declare const Drawer: {
    (props: DrawerRootProps): React.JSX.Element;
    displayName: string;
} & {
    Body: React.ForwardRefExoticComponent<DrawerBodyProps & React.RefAttributes<HTMLDivElement>>;
    Close: React.ForwardRefExoticComponent<DrawerCloseProps & React.RefAttributes<HTMLButtonElement>>;
    Content: React.ForwardRefExoticComponent<DrawerContentProps & React.RefAttributes<HTMLDivElement>>;
    Description: React.ForwardRefExoticComponent<DrawerDescriptionProps & React.RefAttributes<HTMLParagraphElement>>;
    Footer: {
        ({ className, ...props }: DrawerFooterProps): React.JSX.Element;
        displayName: string;
    };
    Header: React.ForwardRefExoticComponent<DrawerHeaderProps & React.RefAttributes<HTMLDivElement>>;
    Title: React.ForwardRefExoticComponent<RadixDialog.DialogTitleProps & React.RefAttributes<HTMLHeadingElement>>;
    Trigger: React.ForwardRefExoticComponent<DrawerTriggerProps & React.RefAttributes<HTMLButtonElement>>;
};
export { Drawer };
//# sourceMappingURL=drawer.d.ts.map