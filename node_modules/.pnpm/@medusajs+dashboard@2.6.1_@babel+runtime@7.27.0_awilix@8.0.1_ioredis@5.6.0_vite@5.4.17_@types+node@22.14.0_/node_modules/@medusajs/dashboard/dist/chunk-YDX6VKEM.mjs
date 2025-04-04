import {
  DateCell
} from "./chunk-WYX5PIA3.mjs";
import {
  TextCell,
  TextHeader
} from "./chunk-MSDRGCRR.mjs";
import {
  PlaceholderCell
} from "./chunk-P3UUX2T6.mjs";

// src/hooks/table/columns/use-campaign-table-columns.tsx
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation as useTranslation3 } from "react-i18next";

// src/components/table/table-cells/sales-channel/description-cell/description-cell.tsx
import { useTranslation } from "react-i18next";
import { jsx } from "react/jsx-runtime";
var DescriptionCell = ({ description }) => {
  if (!description) {
    return /* @__PURE__ */ jsx(PlaceholderCell, {});
  }
  return /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center overflow-hidden", children: /* @__PURE__ */ jsx("span", { className: "truncate", children: description }) });
};
var DescriptionHeader = () => {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx("span", { className: "truncate", children: t("fields.description") }) });
};

// src/components/table/table-cells/sales-channel/name-cell/name-cell.tsx
import { useTranslation as useTranslation2 } from "react-i18next";
import { jsx as jsx2 } from "react/jsx-runtime";
var NameCell = ({ name }) => {
  if (!name) {
    return /* @__PURE__ */ jsx2(PlaceholderCell, {});
  }
  return /* @__PURE__ */ jsx2("div", { className: "flex h-full w-full items-center overflow-hidden", children: /* @__PURE__ */ jsx2("span", { className: "truncate", children: name }) });
};
var NameHeader = () => {
  const { t } = useTranslation2();
  return /* @__PURE__ */ jsx2("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx2("span", { className: "truncate", children: t("fields.name") }) });
};

// src/hooks/table/columns/use-campaign-table-columns.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
var columnHelper = createColumnHelper();
var useCampaignTableColumns = () => {
  const { t } = useTranslation3();
  return useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => /* @__PURE__ */ jsx3(NameHeader, {}),
        cell: ({ getValue }) => /* @__PURE__ */ jsx3(NameCell, { name: getValue() })
      }),
      columnHelper.accessor("description", {
        header: () => /* @__PURE__ */ jsx3(DescriptionHeader, {}),
        cell: ({ getValue }) => /* @__PURE__ */ jsx3(DescriptionCell, { description: getValue() })
      }),
      columnHelper.accessor("campaign_identifier", {
        header: () => /* @__PURE__ */ jsx3(TextHeader, { text: t("campaigns.fields.identifier") }),
        cell: ({ getValue }) => {
          const value = getValue();
          return /* @__PURE__ */ jsx3(TextCell, { text: value });
        }
      }),
      columnHelper.accessor("starts_at", {
        header: () => /* @__PURE__ */ jsx3(TextHeader, { text: t("campaigns.fields.start_date") }),
        cell: ({ getValue }) => {
          const value = getValue();
          if (!value) {
            return;
          }
          const date = new Date(value);
          return /* @__PURE__ */ jsx3(DateCell, { date });
        }
      }),
      columnHelper.accessor("ends_at", {
        header: () => /* @__PURE__ */ jsx3(TextHeader, { text: t("campaigns.fields.end_date") }),
        cell: ({ getValue }) => {
          const value = getValue();
          if (!value) {
            return;
          }
          const date = new Date(value);
          return /* @__PURE__ */ jsx3(DateCell, { date });
        }
      })
    ],
    [t]
  );
};

export {
  useCampaignTableColumns
};
