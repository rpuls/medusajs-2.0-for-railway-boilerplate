"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Checkbox = void 0;
const tslib_1 = require("tslib");
const icons_1 = require("@medusajs/icons");
const radix_ui_1 = require("radix-ui");
const React = tslib_1.__importStar(require("react"));
const clx_1 = require("../../utils/clx");
/**
 * This component is based on the [Radix UI Checkbox](https://www.radix-ui.com/primitives/docs/components/checkbox) primitive.
 */
const Checkbox = React.forwardRef(({ className, checked, ...props }, ref) => {
    return (React.createElement(radix_ui_1.Checkbox.Root, { ...props, ref: ref, checked: checked, className: (0, clx_1.clx)("group inline-flex h-5 w-5 items-center justify-center outline-none ", className) },
        React.createElement("div", { className: (0, clx_1.clx)("text-ui-fg-on-inverted bg-ui-bg-base shadow-borders-base [&_path]:shadow-details-contrast-on-bg-interactive transition-fg h-[15px] w-[15px] rounded-[3px]", "group-disabled:cursor-not-allowed group-disabled:opacity-50", "group-focus-visible:!shadow-borders-interactive-with-focus", "group-hover:group-enabled:group-data-[state=unchecked]:bg-ui-bg-base-hover", "group-data-[state=checked]:bg-ui-bg-interactive group-data-[state=checked]:shadow-borders-interactive-with-shadow", "group-data-[state=indeterminate]:bg-ui-bg-interactive group-data-[state=indeterminate]:shadow-borders-interactive-with-shadow") },
            React.createElement(radix_ui_1.Checkbox.Indicator, null, checked === "indeterminate" ? React.createElement(icons_1.MinusMini, null) : React.createElement(icons_1.CheckMini, null)))));
});
exports.Checkbox = Checkbox;
Checkbox.displayName = "Checkbox";
//# sourceMappingURL=checkbox.js.map