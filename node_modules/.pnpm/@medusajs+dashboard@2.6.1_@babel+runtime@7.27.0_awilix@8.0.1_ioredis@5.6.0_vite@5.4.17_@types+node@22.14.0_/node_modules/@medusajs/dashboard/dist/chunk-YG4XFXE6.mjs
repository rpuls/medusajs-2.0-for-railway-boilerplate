import {
  DateCell,
  DateHeader
} from "./chunk-WYX5PIA3.mjs";
import {
  MoneyAmountCell
} from "./chunk-NNBHHXXN.mjs";
import {
  getOrderFulfillmentStatus,
  getOrderPaymentStatus
} from "./chunk-7DXVXBSA.mjs";
import {
  StatusCell
} from "./chunk-ADOCJB6L.mjs";
import {
  PlaceholderCell
} from "./chunk-P3UUX2T6.mjs";

// src/hooks/table/columns/use-order-table-columns.tsx
import {
  createColumnHelper
} from "@tanstack/react-table";
import { useMemo } from "react";

// src/components/table/table-cells/order/country-cell/country-cell.tsx
import { Tooltip } from "@medusajs/ui";
import ReactCountryFlag from "react-country-flag";
import { jsx } from "react/jsx-runtime";
var CountryCell = ({
  country
}) => {
  if (!country) {
    return /* @__PURE__ */ jsx(PlaceholderCell, {});
  }
  return /* @__PURE__ */ jsx("div", { className: "flex size-5 items-center justify-center", children: /* @__PURE__ */ jsx(Tooltip, { content: country.display_name, children: /* @__PURE__ */ jsx("div", { className: "flex size-4 items-center justify-center overflow-hidden rounded-sm", children: /* @__PURE__ */ jsx(
    ReactCountryFlag,
    {
      countryCode: country.iso_2.toUpperCase(),
      svg: true,
      style: {
        width: "16px",
        height: "16px"
      },
      "aria-label": country.display_name
    }
  ) }) }) });
};

// src/components/table/table-cells/order/customer-cell/customer-cell.tsx
import { useTranslation } from "react-i18next";
import { jsx as jsx2 } from "react/jsx-runtime";
var CustomerCell = ({
  customer
}) => {
  if (!customer) {
    return /* @__PURE__ */ jsx2("span", { className: "text-ui-fg-muted", children: "-" });
  }
  const { first_name, last_name, email } = customer;
  const name = [first_name, last_name].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsx2("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx2("span", { className: "truncate", children: name || email }) });
};
var CustomerHeader = () => {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsx2("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx2("span", { className: "truncate", children: t("fields.customer") }) });
};

// src/components/table/table-cells/order/display-id-cell/display-id-cell.tsx
import { useTranslation as useTranslation2 } from "react-i18next";
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
var DisplayIdCell = ({ displayId }) => {
  if (!displayId) {
    return /* @__PURE__ */ jsx3(PlaceholderCell, {});
  }
  return /* @__PURE__ */ jsx3("div", { className: "text-ui-fg-subtle txt-compact-small flex h-full w-full items-center overflow-hidden", children: /* @__PURE__ */ jsxs("span", { className: "truncate", children: [
    "#",
    displayId
  ] }) });
};
var DisplayIdHeader = () => {
  const { t } = useTranslation2();
  return /* @__PURE__ */ jsx3("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx3("span", { className: "truncate", children: t("fields.order") }) });
};

// src/components/table/table-cells/order/fulfillment-status-cell/fulfillment-status-cell.tsx
import { useTranslation as useTranslation3 } from "react-i18next";
import { jsx as jsx4 } from "react/jsx-runtime";
var FulfillmentStatusCell = ({
  status
}) => {
  const { t } = useTranslation3();
  if (!status) {
    return "-";
  }
  const { label, color } = getOrderFulfillmentStatus(t, status);
  return /* @__PURE__ */ jsx4(StatusCell, { color, children: label });
};
var FulfillmentStatusHeader = () => {
  const { t } = useTranslation3();
  return /* @__PURE__ */ jsx4("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx4("span", { className: "truncate", children: t("fields.fulfillment") }) });
};

// src/components/table/table-cells/order/payment-status-cell/payment-status-cell.tsx
import { useTranslation as useTranslation4 } from "react-i18next";
import { jsx as jsx5 } from "react/jsx-runtime";
var PaymentStatusCell = ({ status }) => {
  const { t } = useTranslation4();
  const { label, color } = getOrderPaymentStatus(t, status);
  return /* @__PURE__ */ jsx5(StatusCell, { color, children: label });
};
var PaymentStatusHeader = () => {
  const { t } = useTranslation4();
  return /* @__PURE__ */ jsx5("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx5("span", { className: "truncate", children: t("fields.payment") }) });
};

// src/components/table/table-cells/order/sales-channel-cell/sales-channel-cell.tsx
import { useTranslation as useTranslation5 } from "react-i18next";
import { jsx as jsx6 } from "react/jsx-runtime";
var SalesChannelCell = ({
  channel
}) => {
  if (!channel) {
    return /* @__PURE__ */ jsx6("span", { className: "text-ui-fg-muted", children: "-" });
  }
  const { name } = channel;
  return /* @__PURE__ */ jsx6("div", { className: "flex h-full w-full items-center overflow-hidden", children: /* @__PURE__ */ jsx6("span", { className: "truncate", children: name }) });
};
var SalesChannelHeader = () => {
  const { t } = useTranslation5();
  return /* @__PURE__ */ jsx6("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx6("span", { className: "truncate", children: t("fields.salesChannel") }) });
};

// src/components/table/table-cells/order/total-cell/total-cell.tsx
import { useTranslation as useTranslation6 } from "react-i18next";
import { jsx as jsx7 } from "react/jsx-runtime";
var TotalCell = ({ currencyCode, total }) => {
  if (!total) {
    return /* @__PURE__ */ jsx7(PlaceholderCell, {});
  }
  return /* @__PURE__ */ jsx7(MoneyAmountCell, { currencyCode, amount: total, align: "right" });
};
var TotalHeader = () => {
  const { t } = useTranslation6();
  return /* @__PURE__ */ jsx7("div", { className: "flex h-full w-full items-center justify-end", children: /* @__PURE__ */ jsx7("span", { className: "truncate", children: t("fields.total") }) });
};

// src/hooks/table/columns/use-order-table-columns.tsx
import { jsx as jsx8 } from "react/jsx-runtime";
var columnHelper = createColumnHelper();
var useOrderTableColumns = (props) => {
  const { exclude = [] } = props ?? {};
  const columns = useMemo(
    () => [
      columnHelper.accessor("display_id", {
        header: () => /* @__PURE__ */ jsx8(DisplayIdHeader, {}),
        cell: ({ getValue }) => {
          const id = getValue();
          return /* @__PURE__ */ jsx8(DisplayIdCell, { displayId: id });
        }
      }),
      columnHelper.accessor("created_at", {
        header: () => /* @__PURE__ */ jsx8(DateHeader, {}),
        cell: ({ getValue }) => {
          const date = new Date(getValue());
          return /* @__PURE__ */ jsx8(DateCell, { date });
        }
      }),
      columnHelper.accessor("customer", {
        header: () => /* @__PURE__ */ jsx8(CustomerHeader, {}),
        cell: ({ getValue }) => {
          const customer = getValue();
          return /* @__PURE__ */ jsx8(CustomerCell, { customer });
        }
      }),
      columnHelper.accessor("sales_channel", {
        header: () => /* @__PURE__ */ jsx8(SalesChannelHeader, {}),
        cell: ({ getValue }) => {
          const channel = getValue();
          return /* @__PURE__ */ jsx8(SalesChannelCell, { channel });
        }
      }),
      columnHelper.accessor("payment_status", {
        header: () => /* @__PURE__ */ jsx8(PaymentStatusHeader, {}),
        cell: ({ getValue }) => {
          const status = getValue();
          return /* @__PURE__ */ jsx8(PaymentStatusCell, { status });
        }
      }),
      columnHelper.accessor("fulfillment_status", {
        header: () => /* @__PURE__ */ jsx8(FulfillmentStatusHeader, {}),
        cell: ({ getValue }) => {
          const status = getValue();
          return /* @__PURE__ */ jsx8(FulfillmentStatusCell, { status });
        }
      }),
      columnHelper.accessor("total", {
        header: () => /* @__PURE__ */ jsx8(TotalHeader, {}),
        cell: ({ getValue, row }) => {
          const total = getValue();
          const currencyCode = row.original.currency_code;
          return /* @__PURE__ */ jsx8(TotalCell, { currencyCode, total });
        }
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => {
          const country = row.original.shipping_address?.country;
          return /* @__PURE__ */ jsx8(CountryCell, { country });
        }
      })
    ],
    []
  );
  const isAccessorColumnDef = (c) => {
    return c.accessorKey !== void 0;
  };
  const isDisplayColumnDef = (c) => {
    return c.id !== void 0;
  };
  const shouldExclude = (c) => {
    if (isAccessorColumnDef(c)) {
      return exclude.includes(c.accessorKey);
    } else if (isDisplayColumnDef(c)) {
      return exclude.includes(c.id);
    }
    return false;
  };
  return columns.filter(
    (c) => !shouldExclude(c)
  );
};

export {
  useOrderTableColumns
};
