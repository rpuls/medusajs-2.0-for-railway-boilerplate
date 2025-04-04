"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusModal = void 0;
const tslib_1 = require("tslib");
const icons_1 = require("@medusajs/icons");
const radix_ui_1 = require("radix-ui");
const React = tslib_1.__importStar(require("react"));
const icon_button_1 = require("../icon-button");
const kbd_1 = require("../kbd");
const clx_1 = require("../../utils/clx");
/**
 * This component is based on the [Radix UI Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) primitives.
 */
const FocusModalRoot = (props) => {
    return React.createElement(radix_ui_1.Dialog.Root, { ...props });
};
FocusModalRoot.displayName = "FocusModal";
/**
 * This component is used to create the trigger button that opens the modal.
 * It accepts props from the [Radix UI Dialog Trigger](https://www.radix-ui.com/primitives/docs/components/dialog#trigger) component.
 */
const FocusModalTrigger = React.forwardRef((props, ref) => {
    return React.createElement(radix_ui_1.Dialog.Trigger, { ref: ref, ...props });
});
FocusModalTrigger.displayName = "FocusModal.Trigger";
/**
 * This component is used to create the close button for the modal.
 * It accepts props from the [Radix UI Dialog Close](https://www.radix-ui.com/primitives/docs/components/dialog#close) component.
 */
const FocusModalClose = radix_ui_1.Dialog.Close;
FocusModalClose.displayName = "FocusModal.Close";
/**
 * The `FocusModal.Content` component uses this component to wrap the modal content.
 * It accepts props from the [Radix UI Dialog Portal](https://www.radix-ui.com/primitives/docs/components/dialog#portal) component.
 */
const FocusModalPortal = (props) => {
    return (React.createElement(radix_ui_1.Dialog.DialogPortal, { ...props }));
};
FocusModalPortal.displayName = "FocusModal.Portal";
/**
 * This component is used to create the overlay for the modal.
 * It accepts props from the [Radix UI Dialog Overlay](https://www.radix-ui.com/primitives/docs/components/dialog#overlay) component.
 */
const FocusModalOverlay = React.forwardRef(({ className, ...props }, ref) => {
    return (React.createElement(radix_ui_1.Dialog.Overlay, { ref: ref, className: (0, clx_1.clx)("bg-ui-bg-overlay fixed inset-0", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className), ...props }));
});
FocusModalOverlay.displayName = "FocusModal.Overlay";
/**
 * This component wraps the content of the modal.
 * It accepts props from the [Radix UI Dialog Content](https://www.radix-ui.com/primitives/docs/components/dialog#content) component.
 */
const FocusModalContent = React.forwardRef(({ className, overlayProps, portalProps, ...props }, ref) => {
    return (React.createElement(FocusModalPortal, { ...portalProps },
        React.createElement(FocusModalOverlay, { ...overlayProps }),
        React.createElement(radix_ui_1.Dialog.Content, { ref: ref, className: (0, clx_1.clx)("bg-ui-bg-base shadow-elevation-modal fixed inset-2 flex flex-col overflow-hidden rounded-lg border outline-none", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-in-from-bottom-2  duration-200", className), ...props })));
});
FocusModalContent.displayName = "FocusModal.Content";
/**
 * This component is used to wrap the header content of the modal.
 * This component is based on the `div` element and supports all of its props
 */
const FocusModalHeader = React.forwardRef(({ children, className, ...props }, ref) => {
    return (React.createElement("div", { ref: ref, className: (0, clx_1.clx)("border-ui-border-base flex items-center justify-between gap-x-4 border-b px-4 py-2", className), ...props },
        React.createElement("div", { className: "flex items-center gap-x-2" },
            React.createElement(radix_ui_1.Dialog.Close, { asChild: true },
                React.createElement(icon_button_1.IconButton, { size: "small", type: "button", variant: "transparent" },
                    React.createElement(icons_1.XMark, null))),
            React.createElement(kbd_1.Kbd, null, "esc")),
        children));
});
FocusModalHeader.displayName = "FocusModal.Header";
/**
 * This component is used to wrap the footer content of the modal.
 * This component is based on the `div` element and supports all of its props
 */
const FocusModalFooter = React.forwardRef(({ children, className, ...props }, ref) => {
    return (React.createElement("div", { ref: ref, className: (0, clx_1.clx)("border-ui-border-base flex items-center justify-end gap-x-2 border-t p-4", className), ...props }, children));
});
FocusModalFooter.displayName = "FocusModal.Footer";
/**
 * This component adds an accessible title to the modal.
 * It accepts props from the [Radix UI Dialog Title](https://www.radix-ui.com/primitives/docs/components/dialog#title) component.
 */
const FocusModalTitle = React.forwardRef(({ className, ...props }, ref) => {
    return (React.createElement(radix_ui_1.Dialog.Title, { ref: ref, ...props }));
});
FocusModalTitle.displayName = "FocusModal.Title";
/**
 * This component adds accessible description to the modal.
 * It accepts props from the [Radix UI Dialog Description](https://www.radix-ui.com/primitives/docs/components/dialog#description) component.
 */
const FocusModalDescription = radix_ui_1.Dialog.Description;
FocusModalDescription.displayName = "FocusModal.Description";
/**
 * This component is used to wrap the body content of the modal.
 * This component is based on the `div` element and supports all of its props
 */
const FocusModalBody = React.forwardRef(({ className, ...props }, ref) => {
    return React.createElement("div", { ref: ref, className: (0, clx_1.clx)("flex-1", className), ...props });
});
FocusModalBody.displayName = "FocusModal.Body";
const FocusModal = Object.assign(FocusModalRoot, {
    Trigger: FocusModalTrigger,
    Title: FocusModalTitle,
    Description: FocusModalDescription,
    Content: FocusModalContent,
    Header: FocusModalHeader,
    Body: FocusModalBody,
    Close: FocusModalClose,
    Footer: FocusModalFooter,
});
exports.FocusModal = FocusModal;
//# sourceMappingURL=focus-modal.js.map