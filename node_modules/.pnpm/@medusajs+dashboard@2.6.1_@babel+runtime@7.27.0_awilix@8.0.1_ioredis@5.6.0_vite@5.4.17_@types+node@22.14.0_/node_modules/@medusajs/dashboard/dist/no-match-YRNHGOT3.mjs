import "./chunk-GH77ZQI2.mjs";

// src/routes/no-match/no-match.tsx
import { ExclamationCircle } from "@medusajs/icons";
import { Button, Text } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
var NoMatch = () => {
  const { t } = useTranslation();
  const title = t("errorBoundary.notFoundTitle");
  const message = t("errorBoundary.noMatchMessage");
  return /* @__PURE__ */ jsx("div", { className: "flex size-full min-h-screen items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-ui-fg-subtle flex flex-col items-center gap-y-3", children: [
      /* @__PURE__ */ jsx(ExclamationCircle, {}),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-y-1", children: [
        /* @__PURE__ */ jsx(Text, { size: "small", leading: "compact", weight: "plus", children: title }),
        /* @__PURE__ */ jsx(
          Text,
          {
            size: "small",
            className: "text-ui-fg-muted text-balance text-center",
            children: message
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(Button, { asChild: true, size: "small", variant: "secondary", children: /* @__PURE__ */ jsx(Link, { to: "/", children: t("errorBoundary.backToDashboard") }) })
  ] }) });
};
export {
  NoMatch as Component
};
