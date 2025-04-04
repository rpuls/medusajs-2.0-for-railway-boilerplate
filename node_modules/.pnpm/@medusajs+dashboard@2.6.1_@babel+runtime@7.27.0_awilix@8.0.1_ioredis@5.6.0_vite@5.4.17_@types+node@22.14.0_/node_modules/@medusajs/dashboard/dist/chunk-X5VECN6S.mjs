// src/components/common/chip-group/chip-group.tsx
import { XMarkMini } from "@medusajs/icons";
import { Button, clx } from "@medusajs/ui";
import { Children, createContext, useContext } from "react";
import { useTranslation } from "react-i18next";
import { jsx, jsxs } from "react/jsx-runtime";
var GroupContext = createContext(null);
var useGroupContext = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error("useGroupContext must be used within a ChipGroup component");
  }
  return context;
};
var Group = ({
  onClearAll,
  onRemove,
  variant = "component",
  className,
  children
}) => {
  const { t } = useTranslation();
  const showClearAll = !!onClearAll && Children.count(children) > 0;
  return /* @__PURE__ */ jsx(GroupContext.Provider, { value: { onRemove, variant }, children: /* @__PURE__ */ jsxs(
    "ul",
    {
      role: "application",
      className: clx("flex flex-wrap items-center gap-2", className),
      children: [
        children,
        showClearAll && /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          Button,
          {
            size: "small",
            variant: "transparent",
            type: "button",
            onClick: onClearAll,
            className: "text-ui-fg-muted active:text-ui-fg-subtle",
            children: t("actions.clearAll")
          }
        ) })
      ]
    }
  ) });
};
var Chip = ({ index, className, children }) => {
  const { onRemove, variant } = useGroupContext();
  return /* @__PURE__ */ jsxs(
    "li",
    {
      className: clx(
        "bg-ui-bg-component shadow-borders-base flex items-stretch divide-x overflow-hidden rounded-md",
        {
          "bg-ui-bg-component": variant === "component",
          "bg-ui-bg-base-": variant === "base"
        },
        className
      ),
      children: [
        /* @__PURE__ */ jsx("span", { className: "txt-compact-small-plus text-ui-fg-subtle flex items-center justify-center px-2 py-1", children }),
        !!onRemove && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onRemove(index),
            type: "button",
            className: clx(
              "text-ui-fg-muted active:text-ui-fg-subtle transition-fg flex items-center justify-center p-1",
              {
                "hover:bg-ui-bg-component-hover active:bg-ui-bg-component-pressed": variant === "component",
                "hover:bg-ui-bg-base-hover active:bg-ui-bg-base-pressed": variant === "base"
              }
            ),
            children: /* @__PURE__ */ jsx(XMarkMini, {})
          }
        )
      ]
    }
  );
};
var ChipGroup = Object.assign(Group, { Chip });

export {
  ChipGroup
};
