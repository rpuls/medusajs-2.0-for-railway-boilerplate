import {
  ListSummary
} from "./chunk-I3VB6NM2.mjs";
import {
  formatProvider
} from "./chunk-IR5DHEKS.mjs";
import {
  PlaceholderCell
} from "./chunk-P3UUX2T6.mjs";
import {
  countries
} from "./chunk-VDBOSWVE.mjs";

// src/hooks/table/columns/use-region-table-columns.tsx
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";

// src/components/table/table-cells/region/countries-cell/countries-cell.tsx
import { useTranslation } from "react-i18next";
import { jsx } from "react/jsx-runtime";
var CountriesCell = ({ countries: countries2 }) => {
  if (!countries2 || countries2.length === 0) {
    return /* @__PURE__ */ jsx(PlaceholderCell, {});
  }
  const list = countries2.map(
    (country) => countries.find((c) => c.iso_2 === country.iso_2)?.display_name
  ).filter(Boolean);
  return /* @__PURE__ */ jsx("div", { className: "flex size-full items-center overflow-hidden", children: /* @__PURE__ */ jsx(ListSummary, { list }) });
};
var CountriesHeader = () => {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsx("div", { className: "flex size-full items-center", children: /* @__PURE__ */ jsx("span", { children: t("fields.countries") }) });
};

// src/components/table/table-cells/region/payment-providers-cell/payment-providers-cell.tsx
import { useTranslation as useTranslation2 } from "react-i18next";
import { jsx as jsx2 } from "react/jsx-runtime";
var PaymentProvidersCell = ({
  paymentProviders
}) => {
  if (!paymentProviders || paymentProviders.length === 0) {
    return /* @__PURE__ */ jsx2(PlaceholderCell, {});
  }
  const displayValues = paymentProviders.map((p) => formatProvider(p.id));
  return /* @__PURE__ */ jsx2("div", { className: "flex size-full items-center overflow-hidden", children: /* @__PURE__ */ jsx2(ListSummary, { list: displayValues }) });
};
var PaymentProvidersHeader = () => {
  const { t } = useTranslation2();
  return /* @__PURE__ */ jsx2("div", { className: "flex size-full items-center overflow-hidden", children: /* @__PURE__ */ jsx2("span", { className: "truncate", children: t("fields.paymentProviders") }) });
};

// src/components/table/table-cells/region/region-cell/region-cell.tsx
import { useTranslation as useTranslation3 } from "react-i18next";
import { jsx as jsx3 } from "react/jsx-runtime";
var RegionCell = ({ name }) => {
  return /* @__PURE__ */ jsx3("div", { className: "flex h-full w-full items-center overflow-hidden", children: /* @__PURE__ */ jsx3("span", { className: "truncate", children: name }) });
};
var RegionHeader = () => {
  const { t } = useTranslation3();
  return /* @__PURE__ */ jsx3("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx3("span", { className: "truncate", children: t("fields.name") }) });
};

// src/hooks/table/columns/use-region-table-columns.tsx
import { jsx as jsx4 } from "react/jsx-runtime";
var columnHelper = createColumnHelper();
var useRegionTableColumns = () => {
  return useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => /* @__PURE__ */ jsx4(RegionHeader, {}),
        cell: ({ getValue }) => /* @__PURE__ */ jsx4(RegionCell, { name: getValue() })
      }),
      columnHelper.accessor("countries", {
        header: () => /* @__PURE__ */ jsx4(CountriesHeader, {}),
        cell: ({ getValue }) => /* @__PURE__ */ jsx4(CountriesCell, { countries: getValue() })
      }),
      columnHelper.accessor("payment_providers", {
        header: () => /* @__PURE__ */ jsx4(PaymentProvidersHeader, {}),
        cell: ({ getValue }) => /* @__PURE__ */ jsx4(PaymentProvidersCell, { paymentProviders: getValue() })
      })
    ],
    []
  );
};

export {
  useRegionTableColumns
};
