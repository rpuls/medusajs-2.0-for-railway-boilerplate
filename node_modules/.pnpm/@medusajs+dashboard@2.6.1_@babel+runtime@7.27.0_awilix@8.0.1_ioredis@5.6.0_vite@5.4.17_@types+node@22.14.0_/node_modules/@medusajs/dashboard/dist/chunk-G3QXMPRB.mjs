import {
  ProductCell,
  ProductHeader
} from "./chunk-IQBAUTU5.mjs";
import {
  StatusCell
} from "./chunk-ADOCJB6L.mjs";
import {
  PlaceholderCell
} from "./chunk-P3UUX2T6.mjs";

// src/hooks/table/columns/use-product-table-columns.tsx
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";

// src/components/table/table-cells/product/collection-cell/collection-cell.tsx
import { useTranslation } from "react-i18next";
import { jsx } from "react/jsx-runtime";
var CollectionCell = ({ collection }) => {
  if (!collection) {
    return /* @__PURE__ */ jsx(PlaceholderCell, {});
  }
  return /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center overflow-hidden", children: /* @__PURE__ */ jsx("span", { className: "truncate", children: collection.title }) });
};
var CollectionHeader = () => {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx("span", { children: t("fields.collection") }) });
};

// src/components/table/table-cells/product/product-status-cell/product-status-cell.tsx
import { useTranslation as useTranslation2 } from "react-i18next";
import { jsx as jsx2 } from "react/jsx-runtime";
var ProductStatusCell = ({ status }) => {
  const { t } = useTranslation2();
  const [color, text] = {
    draft: ["grey", t("products.productStatus.draft")],
    proposed: ["orange", t("products.productStatus.proposed")],
    published: ["green", t("products.productStatus.published")],
    rejected: ["red", t("products.productStatus.rejected")]
  }[status];
  return /* @__PURE__ */ jsx2(StatusCell, { color, children: text });
};
var ProductStatusHeader = () => {
  const { t } = useTranslation2();
  return /* @__PURE__ */ jsx2("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx2("span", { children: t("fields.status") }) });
};

// src/components/table/table-cells/product/sales-channels-cell/sales-channels-cell.tsx
import { Tooltip } from "@medusajs/ui";
import { useTranslation as useTranslation3 } from "react-i18next";
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
var SalesChannelsCell = ({
  salesChannels
}) => {
  const { t } = useTranslation3();
  if (!salesChannels || !salesChannels.length) {
    return /* @__PURE__ */ jsx3(PlaceholderCell, {});
  }
  if (salesChannels.length > 2) {
    return /* @__PURE__ */ jsxs("div", { className: "flex h-full w-full items-center gap-x-1 overflow-hidden", children: [
      /* @__PURE__ */ jsx3("span", { className: "truncate", children: salesChannels.slice(0, 2).map((sc) => sc.name).join(", ") }),
      /* @__PURE__ */ jsx3(
        Tooltip,
        {
          content: /* @__PURE__ */ jsx3("ul", { children: salesChannels.slice(2).map((sc) => /* @__PURE__ */ jsx3("li", { children: sc.name }, sc.id)) }),
          children: /* @__PURE__ */ jsx3("span", { className: "text-xs", children: t("general.plusCountMore", {
            count: salesChannels.length - 2
          }) })
        }
      )
    ] });
  }
  const channels = salesChannels.map((sc) => sc.name).join(", ");
  return /* @__PURE__ */ jsx3("div", { className: "flex h-full w-full items-center overflow-hidden max-w-[250px]", children: /* @__PURE__ */ jsx3("span", { title: channels, className: "truncate", children: channels }) });
};
var SalesChannelHeader = () => {
  const { t } = useTranslation3();
  return /* @__PURE__ */ jsx3("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx3("span", { children: t("fields.salesChannels") }) });
};

// src/components/table/table-cells/product/variant-cell/variant-cell.tsx
import { useTranslation as useTranslation4 } from "react-i18next";
import { jsx as jsx4 } from "react/jsx-runtime";
var VariantCell = ({ variants }) => {
  const { t } = useTranslation4();
  if (!variants || !variants.length) {
    return /* @__PURE__ */ jsx4(PlaceholderCell, {});
  }
  return /* @__PURE__ */ jsx4("div", { className: "flex h-full w-full items-center overflow-hidden", children: /* @__PURE__ */ jsx4("span", { className: "truncate", children: t("products.variantCount", { count: variants.length }) }) });
};
var VariantHeader = () => {
  const { t } = useTranslation4();
  return /* @__PURE__ */ jsx4("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx4("span", { children: t("fields.variants") }) });
};

// src/hooks/table/columns/use-product-table-columns.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
var columnHelper = createColumnHelper();
var useProductTableColumns = () => {
  return useMemo(
    () => [
      columnHelper.display({
        id: "product",
        header: () => /* @__PURE__ */ jsx5(ProductHeader, {}),
        cell: ({ row }) => /* @__PURE__ */ jsx5(ProductCell, { product: row.original })
      }),
      columnHelper.accessor("collection", {
        header: () => /* @__PURE__ */ jsx5(CollectionHeader, {}),
        cell: ({ row }) => /* @__PURE__ */ jsx5(CollectionCell, { collection: row.original.collection })
      }),
      columnHelper.accessor("sales_channels", {
        header: () => /* @__PURE__ */ jsx5(SalesChannelHeader, {}),
        cell: ({ row }) => /* @__PURE__ */ jsx5(SalesChannelsCell, { salesChannels: row.original.sales_channels })
      }),
      columnHelper.accessor("variants", {
        header: () => /* @__PURE__ */ jsx5(VariantHeader, {}),
        cell: ({ row }) => /* @__PURE__ */ jsx5(VariantCell, { variants: row.original.variants })
      }),
      columnHelper.accessor("status", {
        header: () => /* @__PURE__ */ jsx5(ProductStatusHeader, {}),
        cell: ({ row }) => /* @__PURE__ */ jsx5(ProductStatusCell, { status: row.original.status })
      })
    ],
    []
  );
};

export {
  useProductTableColumns
};
