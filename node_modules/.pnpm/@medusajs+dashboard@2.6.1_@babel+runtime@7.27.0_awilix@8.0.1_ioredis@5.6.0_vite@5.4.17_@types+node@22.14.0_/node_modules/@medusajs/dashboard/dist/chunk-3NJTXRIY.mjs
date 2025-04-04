import {
  ConditionalTooltip
} from "./chunk-OC7BQLYI.mjs";

// src/components/common/action-menu/action-menu.tsx
import { DropdownMenu, IconButton, clx } from "@medusajs/ui";
import { EllipsisHorizontal } from "@medusajs/icons";
import { Link } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
var ActionMenu = ({
  groups,
  variant = "transparent",
  children
}) => {
  const inner = children ?? /* @__PURE__ */ jsx(IconButton, { size: "small", variant, children: /* @__PURE__ */ jsx(EllipsisHorizontal, {}) });
  return /* @__PURE__ */ jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsx(DropdownMenu.Trigger, { asChild: true, children: inner }),
    /* @__PURE__ */ jsx(DropdownMenu.Content, { children: groups.map((group, index) => {
      if (!group.actions.length) {
        return null;
      }
      const isLast = index === groups.length - 1;
      return /* @__PURE__ */ jsxs(DropdownMenu.Group, { children: [
        group.actions.map((action, index2) => {
          const Wrapper = action.disabledTooltip ? ({ children: children2 }) => /* @__PURE__ */ jsx(
            ConditionalTooltip,
            {
              showTooltip: action.disabled,
              content: action.disabledTooltip,
              side: "right",
              children: /* @__PURE__ */ jsx("div", { children: children2 })
            }
          ) : "div";
          if (action.onClick) {
            return /* @__PURE__ */ jsx(Wrapper, { children: /* @__PURE__ */ jsxs(
              DropdownMenu.Item,
              {
                disabled: action.disabled,
                onClick: (e) => {
                  e.stopPropagation();
                  action.onClick();
                },
                className: clx(
                  "[&_svg]:text-ui-fg-subtle flex items-center gap-x-2",
                  {
                    "[&_svg]:text-ui-fg-disabled": action.disabled
                  }
                ),
                children: [
                  action.icon,
                  /* @__PURE__ */ jsx("span", { children: action.label })
                ]
              }
            ) }, index2);
          }
          return /* @__PURE__ */ jsx(Wrapper, { children: /* @__PURE__ */ jsx(
            DropdownMenu.Item,
            {
              className: clx(
                "[&_svg]:text-ui-fg-subtle flex items-center gap-x-2",
                {
                  "[&_svg]:text-ui-fg-disabled": action.disabled
                }
              ),
              asChild: true,
              disabled: action.disabled,
              children: /* @__PURE__ */ jsxs(Link, { to: action.to, onClick: (e) => e.stopPropagation(), children: [
                action.icon,
                /* @__PURE__ */ jsx("span", { children: action.label })
              ] })
            }
          ) }, index2);
        }),
        !isLast && /* @__PURE__ */ jsx(DropdownMenu.Separator, {})
      ] }, index);
    }) })
  ] });
};

export {
  ActionMenu
};
