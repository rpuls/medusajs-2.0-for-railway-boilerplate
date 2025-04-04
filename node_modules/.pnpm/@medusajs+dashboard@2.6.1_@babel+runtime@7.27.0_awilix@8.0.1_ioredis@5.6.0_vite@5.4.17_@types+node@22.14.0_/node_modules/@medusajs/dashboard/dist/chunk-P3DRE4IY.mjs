// src/routes/orders/common/placeholders.tsx
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
var ReturnShippingPlaceholder = () => {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs("div", { className: "flex h-[120px] flex-col items-center justify-center gap-2 p-2 text-center", children: [
    /* @__PURE__ */ jsx("span", { className: "txt-small text-ui-fg-subtle font-medium", children: t("orders.returns.placeholders.noReturnShippingOptions.title") }),
    /* @__PURE__ */ jsx("span", { className: "txt-small text-ui-fg-muted", children: /* @__PURE__ */ jsx(
      Trans,
      {
        i18nKey: "orders.returns.placeholders.noReturnShippingOptions.hint",
        components: {
          LinkComponent: /* @__PURE__ */ jsx(Link, { to: `/settings/locations`, className: "text-blue-500" })
        }
      }
    ) })
  ] });
};
var OutboundShippingPlaceholder = () => {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs("div", { className: "flex h-[120px] flex-col items-center justify-center gap-2 p-2 text-center", children: [
    /* @__PURE__ */ jsx("span", { className: "txt-small text-ui-fg-subtle font-medium", children: t("orders.returns.placeholders.outboundShippingOptions.title") }),
    /* @__PURE__ */ jsx("span", { className: "txt-small text-ui-fg-muted", children: /* @__PURE__ */ jsx(
      Trans,
      {
        i18nKey: "orders.returns.placeholders.outboundShippingOptions.hint",
        components: {
          LinkComponent: /* @__PURE__ */ jsx(Link, { to: `/settings/locations`, className: "text-blue-500" })
        }
      }
    ) })
  ] });
};

export {
  ReturnShippingPlaceholder,
  OutboundShippingPlaceholder
};
