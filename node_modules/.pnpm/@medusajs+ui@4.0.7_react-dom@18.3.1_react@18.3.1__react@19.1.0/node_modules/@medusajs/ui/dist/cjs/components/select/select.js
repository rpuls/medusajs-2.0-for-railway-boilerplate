"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Select = void 0;
const tslib_1 = require("tslib");
const icons_1 = require("@medusajs/icons");
const cva_1 = require("cva");
const radix_ui_1 = require("radix-ui");
const React = tslib_1.__importStar(require("react"));
const clx_1 = require("../../utils/clx");
const SelectContext = React.createContext(null);
const useSelectContext = () => {
    const context = React.useContext(SelectContext);
    if (context === null) {
        throw new Error("useSelectContext must be used within a SelectProvider");
    }
    return context;
};
/**
 * This component is based on [Radix UI Select](https://www.radix-ui.com/primitives/docs/components/select).
 * It also accepts all props of the HTML `select` component.
 */
const Root = ({ children, 
/**
 * The select's size.
 */
size = "base", ...props }) => {
    return (React.createElement(SelectContext.Provider, { value: React.useMemo(() => ({ size }), [size]) },
        React.createElement(radix_ui_1.Select.Root, { ...props }, children)));
};
Root.displayName = "Select";
/**
 * Groups multiple items together.
 */
const Group = radix_ui_1.Select.Group;
Group.displayName = "Select.Group";
/**
 * Displays the selected value, or a placeholder if no value is selected.
 * It's based on [Radix UI Select Value](https://www.radix-ui.com/primitives/docs/components/select#value).
 */
const Value = radix_ui_1.Select.Value;
Value.displayName = "Select.Value";
const triggerVariants = (0, cva_1.cva)({
    base: (0, clx_1.clx)("bg-ui-bg-field shadow-buttons-neutral transition-fg flex w-full select-none items-center justify-between rounded-md outline-none", "data-[placeholder]:text-ui-fg-muted text-ui-fg-base", "hover:bg-ui-bg-field-hover", "focus-visible:shadow-borders-interactive-with-active data-[state=open]:!shadow-borders-interactive-with-active", "aria-[invalid=true]:border-ui-border-error aria-[invalid=true]:shadow-borders-error", "invalid:border-ui-border-error invalid:shadow-borders-error", "disabled:!bg-ui-bg-disabled disabled:!text-ui-fg-disabled", "group/trigger"),
    variants: {
        size: {
            base: "h-8 px-2 py-1.5 txt-compact-small",
            small: "h-7 px-2 py-1 txt-compact-small",
        },
    },
});
/**
 * The trigger that toggles the select.
 * It's based on [Radix UI Select Trigger](https://www.radix-ui.com/primitives/docs/components/select#trigger).
 */
const Trigger = React.forwardRef(({ className, children, ...props }, ref) => {
    const { size } = useSelectContext();
    return (React.createElement(radix_ui_1.Select.Trigger, { ref: ref, className: (0, clx_1.clx)(triggerVariants({ size }), className), ...props },
        children,
        React.createElement(radix_ui_1.Select.Icon, { asChild: true },
            React.createElement(icons_1.TrianglesMini, { className: "text-ui-fg-muted group-disabled/trigger:text-ui-fg-disabled" }))));
});
Trigger.displayName = "Select.Trigger";
/**
 * The content that appears when the select is open.
 * It's based on [Radix UI Select Content](https://www.radix-ui.com/primitives/docs/components/select#content).
 */
const Content = React.forwardRef(({ className, children, 
/**
 * Whether to show the select items below (`popper`) or over (`item-aligned`) the select input.
 */
position = "popper", 
/**
 * The distance of the content pop-up in pixels from the select input. Only available when position is set to popper.
 */
sideOffset = 8, 
/**
 * The distance in pixels from the boundary edges where collision detection should occur. Only available when position is set to popper.
 */
collisionPadding = 24, ...props }, ref) => (React.createElement(radix_ui_1.Select.Portal, null,
    React.createElement(radix_ui_1.Select.Content, { ref: ref, className: (0, clx_1.clx)("bg-ui-bg-component text-ui-fg-base shadow-elevation-flyout relative max-h-[200px] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg", "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95", "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", {
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1": position === "popper",
        }, className), position: position, sideOffset: sideOffset, collisionPadding: collisionPadding, ...props },
        React.createElement(radix_ui_1.Select.Viewport, { className: (0, clx_1.clx)("p-1", position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]") }, children)))));
Content.displayName = "Select.Content";
/**
 * Used to label a group of items.
 * It's based on [Radix UI Select Label](https://www.radix-ui.com/primitives/docs/components/select#label).
 */
const Label = React.forwardRef(({ className, ...props }, ref) => (React.createElement(radix_ui_1.Select.Label, { ref: ref, className: (0, clx_1.clx)("txt-compact-xsmall-plus text-ui-fg-muted px-2 py-1.5", className), ...props })));
Label.displayName = "Select.Label";
/**
 * An item in the select. It's based on [Radix UI Select Item](https://www.radix-ui.com/primitives/docs/components/select#item)
 * and accepts its props.
 */
const Item = React.forwardRef(({ className, children, ...props }, ref) => {
    return (React.createElement(radix_ui_1.Select.Item, { ref: ref, className: (0, clx_1.clx)("bg-ui-bg-component grid cursor-pointer grid-cols-[15px_1fr] gap-x-2 rounded-[4px] px-2 py-1.5 outline-none transition-colors txt-compact-small items-center", "focus-visible:bg-ui-bg-component-hover", "active:bg-ui-bg-component-pressed", "data-[state=checked]:txt-compact-small-plus", "disabled:text-ui-fg-disabled", className), ...props },
        React.createElement("span", { className: "flex h-[15px] w-[15px] items-center justify-center" },
            React.createElement(radix_ui_1.Select.ItemIndicator, { className: "flex items-center justify-center" },
                React.createElement(icons_1.Check, null))),
        React.createElement(radix_ui_1.Select.ItemText, { className: "flex-1 truncate" }, children)));
});
Item.displayName = "Select.Item";
const Separator = React.forwardRef(({ className, ...props }, ref) => (React.createElement(radix_ui_1.Select.Separator, { ref: ref, className: (0, clx_1.clx)("bg-ui-border-component -mx-1 my-1 h-0.5 border-t border-t-ui-border-menu-top border-b border-b-ui-border-menu-bot", className), ...props })));
Separator.displayName = "Select.Separator";
const Select = Object.assign(Root, {
    Group,
    Value,
    Trigger,
    Content,
    Label,
    Item,
    Separator,
});
exports.Select = Select;
//# sourceMappingURL=select.js.map