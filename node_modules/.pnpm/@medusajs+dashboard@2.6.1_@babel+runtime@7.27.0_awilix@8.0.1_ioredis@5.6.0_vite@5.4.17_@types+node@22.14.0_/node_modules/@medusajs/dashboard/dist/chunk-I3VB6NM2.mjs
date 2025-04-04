// src/components/common/list-summary/list-summary.tsx
import { Tooltip, clx } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { jsx, jsxs } from "react/jsx-runtime";
var ListSummary = ({
  list,
  className,
  variant = "compact",
  inline,
  n = 2
}) => {
  const { t } = useTranslation();
  const title = t("general.plusCountMore", {
    count: list.length - n
  });
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: clx(
        "text-ui-fg-subtle gap-x-1 overflow-hidden",
        {
          "inline-flex": inline,
          flex: !inline,
          "txt-compact-small": variant === "compact",
          "txt-small": variant === "base"
        },
        className
      ),
      children: [
        /* @__PURE__ */ jsx("div", { className: "flex-1 truncate", children: /* @__PURE__ */ jsx("span", { className: "truncate", children: list.slice(0, n).join(", ") }) }),
        list.length > n && /* @__PURE__ */ jsx("div", { className: "whitespace-nowrap", children: /* @__PURE__ */ jsx(
          Tooltip,
          {
            content: /* @__PURE__ */ jsx("ul", { children: list.slice(n).map((c) => /* @__PURE__ */ jsx("li", { children: c }, c)) }),
            children: /* @__PURE__ */ jsx("span", { className: "cursor-default whitespace-nowrap", children: title })
          }
        ) })
      ]
    }
  );
};

export {
  ListSummary
};
