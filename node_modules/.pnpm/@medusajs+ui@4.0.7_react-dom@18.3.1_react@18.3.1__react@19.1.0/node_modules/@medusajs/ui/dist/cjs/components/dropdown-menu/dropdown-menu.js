"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropdownMenu = void 0;
const tslib_1 = require("tslib");
const icons_1 = require("@medusajs/icons");
const radix_ui_1 = require("radix-ui");
const React = tslib_1.__importStar(require("react"));
const clx_1 = require("../../utils/clx");
/**
 * This component is based on the [Radix UI Dropdown Menu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu) primitive.
 */
const Root = radix_ui_1.DropdownMenu.Root;
Root.displayName = "DropdownMenu";
/**
 * This component is based on the [Radix UI Dropdown Menu Trigger](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#trigger) primitive.
 */
const Trigger = radix_ui_1.DropdownMenu.Trigger;
Trigger.displayName = "DropdownMenu.Trigger";
/**
 * This component is based on the [Radix UI Dropdown Menu Group](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#group) primitive.
 */
const Group = radix_ui_1.DropdownMenu.Group;
Group.displayName = "DropdownMenu.Group";
/**
 * This component is based on the [Radix UI Dropdown Menu Sub](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#sub) primitive.
 */
const SubMenu = radix_ui_1.DropdownMenu.Sub;
SubMenu.displayName = "DropdownMenu.SubMenu";
/**
 * This component is based on the [Radix UI Dropdown Menu RadioGroup](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#radiogroup) primitive.
 */
const RadioGroup = radix_ui_1.DropdownMenu.RadioGroup;
RadioGroup.displayName = "DropdownMenu.RadioGroup";
/**
 * This component is based on the [Radix UI Dropdown Menu SubTrigger](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#subtrigger) primitive.
 */
const SubMenuTrigger = React.forwardRef(({ className, children, ...props }, ref) => (React.createElement(radix_ui_1.DropdownMenu.SubTrigger, { ref: ref, className: (0, clx_1.clx)("bg-ui-bg-component text-ui-fg-base txt-compact-small relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 outline-none transition-colors", "focus-visible:bg-ui-bg-component-hover focus:bg-ui-bg-component-hover", "active:bg-ui-bg-component-hover", "data-[disabled]:text-ui-fg-disabled data-[disabled]:pointer-events-none", "data-[state=open]:!bg-ui-bg-component-hover", className), ...props },
    children,
    React.createElement(icons_1.ChevronRightMini, { className: "text-ui-fg-muted ml-auto" }))));
SubMenuTrigger.displayName = "DropdownMenu.SubMenuTrigger";
/**
 * This component is based on the [Radix UI Dropdown Menu SubContent](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#subcontent) primitive.
 */
const SubMenuContent = React.forwardRef(({ className, collisionPadding = 8, ...props }, ref) => (React.createElement(radix_ui_1.DropdownMenu.Portal, null,
    React.createElement(radix_ui_1.DropdownMenu.SubContent, { ref: ref, collisionPadding: collisionPadding, className: (0, clx_1.clx)("bg-ui-bg-component text-ui-fg-base shadow-elevation-flyout max-h-[var(--radix-popper-available-height)] min-w-[220px] overflow-hidden rounded-lg p-1", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className), ...props }))));
SubMenuContent.displayName = "DropdownMenu.SubMenuContent";
/**
 * This component is based on the [Radix UI Dropdown Menu Content](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#content) primitive.
 */
const Content = React.forwardRef(({ className, sideOffset = 8, collisionPadding = 8, align = "center", ...props }, ref) => (React.createElement(radix_ui_1.DropdownMenu.Portal, null,
    React.createElement(radix_ui_1.DropdownMenu.Content, { ref: ref, sideOffset: sideOffset, align: align, collisionPadding: collisionPadding, className: (0, clx_1.clx)("bg-ui-bg-component text-ui-fg-base shadow-elevation-flyout max-h-[var(--radix-popper-available-height)] min-w-[220px] overflow-hidden rounded-lg p-1", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className), ...props }))));
Content.displayName = "DropdownMenu.Content";
/**
 * This component is based on the [Radix UI Dropdown Menu Item](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#item) primitive.
 */
const Item = React.forwardRef(({ className, ...props }, ref) => (React.createElement(radix_ui_1.DropdownMenu.Item, { ref: ref, className: (0, clx_1.clx)("bg-ui-bg-component text-ui-fg-base txt-compact-small relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 outline-none transition-colors", "focus-visible:bg-ui-bg-component-hover focus:bg-ui-bg-component-hover", "active:bg-ui-bg-component-hover", "data-[disabled]:text-ui-fg-disabled data-[disabled]:pointer-events-none", className), ...props })));
Item.displayName = "DropdownMenu.Item";
/**
 * This component is based on the [Radix UI Dropdown Menu CheckboxItem](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#checkboxitem) primitive.
 */
const CheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => (React.createElement(radix_ui_1.DropdownMenu.CheckboxItem, { ref: ref, className: (0, clx_1.clx)("bg-ui-bg-component text-ui-fg-base txt-compact-small relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-[31px] pr-2 outline-none transition-colors", "focus-visible:bg-ui-bg-component-hover focus:bg-ui-bg-component-hover", "active:bg-ui-bg-component-hover", "data-[disabled]:text-ui-fg-disabled data-[disabled]:pointer-events-none", "data-[state=checked]:txt-compact-small-plus", className), checked: checked, ...props },
    React.createElement("span", { className: "absolute left-2 flex size-[15px] items-center justify-center" },
        React.createElement(radix_ui_1.DropdownMenu.ItemIndicator, null,
            React.createElement(icons_1.CheckMini, null))),
    children)));
CheckboxItem.displayName = "DropdownMenu.CheckboxItem";
/**
 * This component is based on the [Radix UI Dropdown Menu RadioItem](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#radioitem) primitive.
 */
const RadioItem = React.forwardRef(({ className, children, ...props }, ref) => (React.createElement(radix_ui_1.DropdownMenu.RadioItem, { ref: ref, className: (0, clx_1.clx)("bg-ui-bg-component txt-compact-small relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-[31px] pr-2 outline-none transition-colors", "focus-visible:bg-ui-bg-component-hover focus:bg-ui-bg-component-hover", "active:bg-ui-bg-component-hover", "data-[disabled]:text-ui-fg-disabled data-[disabled]:pointer-events-none", "data-[state=checked]:txt-compact-small-plus", className), ...props },
    React.createElement("span", { className: "absolute left-2 flex size-[15px] items-center justify-center" },
        React.createElement(radix_ui_1.DropdownMenu.ItemIndicator, null,
            React.createElement(icons_1.EllipseMiniSolid, { className: "text-ui-fg-base" }))),
    children)));
RadioItem.displayName = "DropdownMenu.RadioItem";
/**
 * This component is based on the [Radix UI Dropdown Menu Label](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#label) primitive.
 */
const Label = React.forwardRef(({ className, ...props }, ref) => (React.createElement(radix_ui_1.DropdownMenu.Label, { ref: ref, className: (0, clx_1.clx)("text-ui-fg-subtle txt-compact-xsmall-plus", className), ...props })));
Label.displayName = "DropdownMenu.Label";
/**
 * This component is based on the [Radix UI Dropdown Menu Separator](https://www.radix-ui.com/primitives/docs/components/dropdown-menu#separator) primitive.
 */
const Separator = React.forwardRef(({ className, ...props }, ref) => (React.createElement(radix_ui_1.DropdownMenu.Separator, { ref: ref, className: (0, clx_1.clx)("bg-ui-border-component border-t-ui-border-menu-top border-b-ui-border-menu-bot -mx-1 my-1 h-0.5 border-b border-t", className), ...props })));
Separator.displayName = "DropdownMenu.Separator";
/**
 * This component is based on the `span` element and supports all of its props
 */
const Shortcut = ({ className, ...props }) => {
    return (React.createElement("span", { className: (0, clx_1.clx)("text-ui-fg-subtle txt-compact-small ml-auto tracking-widest", className), ...props }));
};
Shortcut.displayName = "DropdownMenu.Shortcut";
/**
 * This component is based on the `span` element and supports all of its props
 */
const Hint = ({ className, ...props }) => {
    return (React.createElement("span", { className: (0, clx_1.clx)("text-ui-fg-subtle txt-compact-small ml-auto tracking-widest", className), ...props }));
};
Hint.displayName = "DropdownMenu.Hint";
const DropdownMenu = Object.assign(Root, {
    Trigger,
    Group,
    SubMenu,
    SubMenuContent,
    SubMenuTrigger,
    Content,
    Item,
    CheckboxItem,
    RadioGroup,
    RadioItem,
    Label,
    Separator,
    Shortcut,
    Hint,
});
exports.DropdownMenu = DropdownMenu;
//# sourceMappingURL=dropdown-menu.js.map