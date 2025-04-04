// src/components/common/empty-table-content/empty-table-content.tsx
import { ExclamationCircle, MagnifyingGlass, PlusMini } from "@medusajs/icons";
import { Button, Text, clx } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
var NoResults = ({ title, message, className }) => {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: clx(
        "flex h-[400px] w-full items-center justify-center",
        className
      ),
      children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-y-2", children: [
        /* @__PURE__ */ jsx(MagnifyingGlass, {}),
        /* @__PURE__ */ jsx(Text, { size: "small", leading: "compact", weight: "plus", children: title ?? t("general.noResultsTitle") }),
        /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle", children: message ?? t("general.noResultsMessage") })
      ] })
    }
  );
};
var DefaultButton = ({ action }) => action && /* @__PURE__ */ jsx(Link, { to: action.to, children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "small", children: action.label }) });
var TransparentIconLeftButton = ({ action }) => action && /* @__PURE__ */ jsx(Link, { to: action.to, children: /* @__PURE__ */ jsxs(Button, { variant: "transparent", className: "text-ui-fg-interactive", children: [
  /* @__PURE__ */ jsx(PlusMini, {}),
  " ",
  action.label
] }) });
var NoRecords = ({
  title,
  message,
  action,
  className,
  buttonVariant = "default"
}) => {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: clx(
        "flex h-[400px] w-full flex-col items-center justify-center gap-y-4",
        className
      ),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-y-3", children: [
          /* @__PURE__ */ jsx(ExclamationCircle, { className: "text-ui-fg-subtle" }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-y-1", children: [
            /* @__PURE__ */ jsx(Text, { size: "small", leading: "compact", weight: "plus", children: title ?? t("general.noRecordsTitle") }),
            /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-muted", children: message ?? t("general.noRecordsMessage") })
          ] })
        ] }),
        buttonVariant === "default" && /* @__PURE__ */ jsx(DefaultButton, { action }),
        buttonVariant === "transparentIconLeft" && /* @__PURE__ */ jsx(TransparentIconLeftButton, { action })
      ]
    }
  );
};

export {
  NoResults,
  NoRecords
};
