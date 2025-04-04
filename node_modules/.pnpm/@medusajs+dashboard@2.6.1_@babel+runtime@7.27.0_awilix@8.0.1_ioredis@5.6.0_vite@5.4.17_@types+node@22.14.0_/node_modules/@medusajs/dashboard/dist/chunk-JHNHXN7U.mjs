import {
  getProvinceByIso2,
  isProvinceInCountry
} from "./chunk-THZJC662.mjs";
import {
  IconAvatar
} from "./chunk-EQTBJSBZ.mjs";
import {
  getCountryByIso2
} from "./chunk-VDBOSWVE.mjs";
import {
  ActionMenu
} from "./chunk-3NJTXRIY.mjs";
import {
  useDeleteTaxRate
} from "./chunk-5OOAHPXU.mjs";
import {
  useDeleteTaxRegion
} from "./chunk-VJRTPNEA.mjs";

// src/routes/tax-regions/common/components/tax-region-card/tax-region-card.tsx
import { Heading, Text, Tooltip, clx } from "@medusajs/ui";
import ReactCountryFlag from "react-country-flag";
import { ExclamationCircle, MapPin, Plus, Trash } from "@medusajs/icons";
import { useTranslation as useTranslation2 } from "react-i18next";
import { Link } from "react-router-dom";

// src/routes/tax-regions/common/hooks.ts
import { toast, usePrompt } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
var useDeleteTaxRegionAction = ({
  taxRegion,
  to = "/settings/tax-regions"
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const prompt = usePrompt();
  const { mutateAsync } = useDeleteTaxRegion(taxRegion.id);
  const handleDelete = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("taxRegions.delete.confirmation"),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel")
    });
    if (!res) {
      return;
    }
    await mutateAsync(void 0, {
      onSuccess: () => {
        toast.success(t("taxRegions.delete.successToast"));
        navigate(to, { replace: true });
      },
      onError: (e) => {
        toast.error(e.message);
      }
    });
  };
  return handleDelete;
};
var useDeleteTaxRateAction = (taxRate) => {
  const { t } = useTranslation();
  const prompt = usePrompt();
  const { mutateAsync } = useDeleteTaxRate(taxRate.id);
  const handleDelete = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("taxRegions.taxRates.delete.confirmation", {
        name: taxRate.name
      }),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel")
    });
    if (!res) {
      return;
    }
    await mutateAsync(void 0, {
      onSuccess: () => {
        toast.success(t("taxRegions.taxRates.delete.successToast"));
      },
      onError: (e) => {
        toast.error(e.message);
      }
    });
  };
  return handleDelete;
};

// src/routes/tax-regions/common/components/tax-region-card/tax-region-card.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var TaxRegionCard = ({
  taxRegion,
  type = "list",
  variant = "country",
  asLink = true,
  badge
}) => {
  const { t } = useTranslation2();
  const { id, country_code, province_code } = taxRegion;
  const country = getCountryByIso2(country_code);
  const province = getProvinceByIso2(province_code);
  let name = "N/A";
  let misconfiguredSublevelTooltip = null;
  if (province || province_code) {
    name = province ? province : province_code.toUpperCase();
  } else if (country || country_code) {
    name = country ? country.display_name : country_code.toUpperCase();
  }
  if (country_code && province_code && !isProvinceInCountry(country_code, province_code)) {
    name = province_code.toUpperCase();
    misconfiguredSublevelTooltip = t(
      "taxRegions.fields.sublevels.tooltips.notPartOfCountry",
      {
        country: country?.display_name,
        province: province_code.toUpperCase()
      }
    );
  }
  const showCreateDefaultTaxRate = !taxRegion.tax_rates.filter((tr) => tr.is_default).length && type === "header";
  const Component = /* @__PURE__ */ jsxs(
    "div",
    {
      className: clx(
        "group-data-[link=true]:hover:bg-ui-bg-base-hover transition-fg flex flex-col justify-between gap-y-4 px-6 md:flex-row md:items-center md:gap-y-0",
        {
          "py-4": type === "header",
          "py-3": type === "list"
        }
      ),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-x-4", children: [
            /* @__PURE__ */ jsx(IconAvatar, { size: type === "list" ? "small" : "large", children: country_code && !province_code ? /* @__PURE__ */ jsx(
              "div",
              {
                className: clx(
                  "flex size-fit items-center justify-center overflow-hidden rounded-[1px]",
                  {
                    "rounded-sm": type === "header"
                  }
                ),
                children: /* @__PURE__ */ jsx(
                  ReactCountryFlag,
                  {
                    countryCode: country_code,
                    svg: true,
                    style: type === "list" ? { width: "12px", height: "9px" } : { width: "16px", height: "12px" },
                    "aria-label": country?.display_name
                  }
                )
              }
            ) : /* @__PURE__ */ jsx(MapPin, { className: "text-ui-fg-subtle" }) }),
            /* @__PURE__ */ jsx("div", { children: type === "list" ? /* @__PURE__ */ jsx(Text, { size: "small", weight: "plus", leading: "compact", children: name }) : /* @__PURE__ */ jsx(Heading, { children: name }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex size-fit items-center gap-x-2 md:hidden", children: [
            misconfiguredSublevelTooltip && /* @__PURE__ */ jsx(Tooltip, { content: misconfiguredSublevelTooltip, children: /* @__PURE__ */ jsx(ExclamationCircle, { className: "text-ui-tag-orange-icon" }) }),
            badge,
            /* @__PURE__ */ jsx(
              TaxRegionCardActions,
              {
                taxRegion,
                showCreateDefaultTaxRate
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hidden size-fit items-center gap-x-2 md:flex", children: [
          misconfiguredSublevelTooltip && /* @__PURE__ */ jsx(Tooltip, { content: misconfiguredSublevelTooltip, children: /* @__PURE__ */ jsx(ExclamationCircle, { className: "text-ui-tag-orange-icon" }) }),
          badge,
          /* @__PURE__ */ jsx(
            TaxRegionCardActions,
            {
              taxRegion,
              showCreateDefaultTaxRate
            }
          )
        ] })
      ]
    }
  );
  if (asLink) {
    return /* @__PURE__ */ jsx(
      Link,
      {
        to: variant === "country" ? `${id}` : `provinces/${id}`,
        "data-link": "true",
        className: "group block",
        children: Component
      }
    );
  }
  return Component;
};
var TaxRegionCardActions = ({
  taxRegion,
  showCreateDefaultTaxRate
}) => {
  const { t } = useTranslation2();
  const to = taxRegion.parent_id ? `/settings/tax-regions/${taxRegion.parent_id}` : void 0;
  const handleDelete = useDeleteTaxRegionAction({ taxRegion, to });
  return /* @__PURE__ */ jsx(
    ActionMenu,
    {
      groups: [
        ...showCreateDefaultTaxRate ? [
          {
            actions: [
              {
                icon: /* @__PURE__ */ jsx(Plus, {}),
                label: t("taxRegions.fields.defaultTaxRate.action"),
                to: `tax-rates/create`
              }
            ]
          }
        ] : [],
        {
          actions: [
            {
              icon: /* @__PURE__ */ jsx(Trash, {}),
              label: t("actions.delete"),
              onClick: handleDelete
            }
          ]
        }
      ]
    }
  );
};

// src/components/localization/localized-table-pagination/localized-table-pagination.tsx
import { Table } from "@medusajs/ui";
import { forwardRef } from "react";
import { useTranslation as useTranslation3 } from "react-i18next";
import { jsx as jsx2 } from "react/jsx-runtime";
var LocalizedTablePagination = forwardRef((props, ref) => {
  const { t } = useTranslation3();
  const translations = {
    of: t("general.of"),
    results: t("general.results"),
    pages: t("general.pages"),
    prev: t("general.prev"),
    next: t("general.next")
  };
  return /* @__PURE__ */ jsx2(Table.Pagination, { ...props, translations, ref });
});
LocalizedTablePagination.displayName = "LocalizedTablePagination";

export {
  LocalizedTablePagination,
  useDeleteTaxRateAction,
  TaxRegionCard
};
