// src/components/common/badge-list-summary/badge-list-summary.tsx
import { Badge, Tooltip, clx } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { jsx, jsxs } from "react/jsx-runtime";
var BadgeListSummary = ({
  list,
  className,
  inline,
  rounded = false,
  n = 2
}) => {
  const { t } = useTranslation();
  const title = t("general.plusCount", {
    count: list.length - n
  });
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: clx(
        "text-ui-fg-subtle txt-compact-small gap-x-2 overflow-hidden",
        {
          "inline-flex": inline,
          flex: !inline
        },
        className
      ),
      children: [
        list.slice(0, n).map((item) => {
          return /* @__PURE__ */ jsx(Badge, { rounded: rounded ? "full" : "base", size: "2xsmall", children: item }, item);
        }),
        list.length > n && /* @__PURE__ */ jsx("div", { className: "whitespace-nowrap", children: /* @__PURE__ */ jsx(
          Tooltip,
          {
            content: /* @__PURE__ */ jsx("ul", { children: list.slice(n).map((c) => /* @__PURE__ */ jsx("li", { children: c }, c)) }),
            children: /* @__PURE__ */ jsx(
              Badge,
              {
                rounded: rounded ? "full" : "base",
                size: "2xsmall",
                className: "cursor-default whitespace-nowrap",
                children: title
              }
            )
          }
        ) })
      ]
    }
  );
};

export {
  BadgeListSummary
};
