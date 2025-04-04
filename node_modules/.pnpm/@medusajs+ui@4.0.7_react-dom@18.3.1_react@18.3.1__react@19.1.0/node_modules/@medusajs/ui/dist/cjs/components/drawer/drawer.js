"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Drawer = void 0;
const tslib_1 = require("tslib");
const icons_1 = require("@medusajs/icons");
const radix_ui_1 = require("radix-ui");
const React = tslib_1.__importStar(require("react"));
const icon_button_1 = require("../icon-button");
const kbd_1 = require("../kbd");
const text_1 = require("../text");
const clx_1 = require("../../utils/clx");
/**
 * This component is based on the [Radix UI Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) primitives.
 */
const DrawerRoot = (props) => {
    return React.createElement(radix_ui_1.Dialog.Root, { ...props });
};
DrawerRoot.displayName = "Drawer";
/**
 * This component is used to create the trigger button that opens the drawer.
 * It accepts props from the [Radix UI Dialog Trigger](https://www.radix-ui.com/primitives/docs/components/dialog#trigger) component.
 */
const DrawerTrigger = React.forwardRef(({ className, ...props }, ref) => {
    return (React.createElement(radix_ui_1.Dialog.Trigger, { ref: ref, className: (0, clx_1.clx)(className), ...props }));
});
DrawerTrigger.displayName = "Drawer.Trigger";
/**
 * This component is used to create the close button for the drawer.
 * It accepts props from the [Radix UI Dialog Close](https://www.radix-ui.com/primitives/docs/components/dialog#close) component.
 */
const DrawerClose = React.forwardRef(({ className, ...props }, ref) => {
    return (React.createElement(radix_ui_1.Dialog.Close, { ref: ref, className: (0, clx_1.clx)(className), ...props }));
});
DrawerClose.displayName = "Drawer.Close";
/**
 * The `Drawer.Content` component uses this component to wrap the drawer content.
 * It accepts props from the [Radix UI Dialog Portal](https://www.radix-ui.com/primitives/docs/components/dialog#portal) component.
 */
const DrawerPortal = (props) => {
    return React.createElement(radix_ui_1.Dialog.DialogPortal, { ...props });
};
DrawerPortal.displayName = "Drawer.Portal";
/**
 * This component is used to create the overlay for the drawer.
 * It accepts props from the [Radix UI Dialog Overlay](https://www.radix-ui.com/primitives/docs/components/dialog#overlay) component.
 */
const DrawerOverlay = React.forwardRef(({ className, ...props }, ref) => {
    return (React.createElement(radix_ui_1.Dialog.Overlay, { ref: ref, className: (0, clx_1.clx)("bg-ui-bg-overlay fixed inset-0", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className), ...props }));
});
DrawerOverlay.displayName = "Drawer.Overlay";
/**
 * This component wraps the content of the drawer.
 * It accepts props from the [Radix UI Dialog Content](https://www.radix-ui.com/primitives/docs/components/dialog#content) component.
 */
const DrawerContent = React.forwardRef(({ className, overlayProps, portalProps, ...props }, ref) => {
    return (React.createElement(DrawerPortal, { ...portalProps },
        React.createElement(DrawerOverlay, { ...overlayProps }),
        React.createElement(radix_ui_1.Dialog.Content, { ref: ref, className: (0, clx_1.clx)("bg-ui-bg-base shadow-elevation-modal border-ui-border-base fixed inset-y-2 flex w-full flex-1 flex-col rounded-lg border outline-none max-sm:inset-x-2 max-sm:w-[calc(100%-16px)] sm:right-2 sm:max-w-[560px]", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-1/2 data-[state=open]:slide-in-from-right-1/2 duration-200", className), ...props })));
});
DrawerContent.displayName = "Drawer.Content";
/**
 * This component is used to wrap the header content of the drawer.
 * This component is based on the `div` element and supports all of its props.
 */
const DrawerHeader = React.forwardRef(({ children, className, ...props }, ref) => {
    return (React.createElement("div", { ref: ref, className: "border-ui-border-base flex items-start justify-between gap-x-4 border-b px-6 py-4", ...props },
        React.createElement("div", { className: (0, clx_1.clx)("flex flex-col gap-y-1", className) }, children),
        React.createElement("div", { className: "flex items-center gap-x-2" },
            React.createElement(kbd_1.Kbd, null, "esc"),
            React.createElement(radix_ui_1.Dialog.Close, { asChild: true },
                React.createElement(icon_button_1.IconButton, { size: "small", type: "button", variant: "transparent" },
                    React.createElement(icons_1.XMark, null))))));
});
DrawerHeader.displayName = "Drawer.Header";
/**
 * This component is used to wrap the body content of the drawer.
 * This component is based on the `div` element and supports all of its props
 */
const DrawerBody = React.forwardRef(({ className, ...props }, ref) => {
    return (React.createElement("div", { ref: ref, className: (0, clx_1.clx)("flex-1 px-6 py-4", className), ...props }));
});
DrawerBody.displayName = "Drawer.Body";
/**
 * This component is used to wrap the footer content of the drawer.
 * This component is based on the `div` element and supports all of its props.
 */
const DrawerFooter = ({ className, ...props }) => {
    return (React.createElement("div", { className: (0, clx_1.clx)("border-ui-border-base flex items-center justify-end space-x-2 overflow-y-auto border-t px-6 py-4", className), ...props }));
};
DrawerFooter.displayName = "Drawer.Footer";
/**
 * This component adds an accessible title to the drawer.
 * It accepts props from the [Radix UI Dialog Title](https://www.radix-ui.com/primitives/docs/components/dialog#title) component.
 */
const DrawerTitle = radix_ui_1.Dialog.Title;
DrawerTitle.displayName = "Drawer.Title";
/**
 * This component adds accessible description to the drawer.
 * It accepts props from the [Radix UI Dialog Description](https://www.radix-ui.com/primitives/docs/components/dialog#description) component.
 */
const DrawerDescription = React.forwardRef(({ className, children, ...props }, ref) => (React.createElement(radix_ui_1.Dialog.Description, { ref: ref, className: (0, clx_1.clx)(className), asChild: true, ...props },
    React.createElement(text_1.Text, null, children))));
DrawerDescription.displayName = "Drawer.Description";
const Drawer = Object.assign(DrawerRoot, {
    Body: DrawerBody,
    Close: DrawerClose,
    Content: DrawerContent,
    Description: DrawerDescription,
    Footer: DrawerFooter,
    Header: DrawerHeader,
    Title: DrawerTitle,
    Trigger: DrawerTrigger,
});
exports.Drawer = Drawer;
//# sourceMappingURL=drawer.js.map