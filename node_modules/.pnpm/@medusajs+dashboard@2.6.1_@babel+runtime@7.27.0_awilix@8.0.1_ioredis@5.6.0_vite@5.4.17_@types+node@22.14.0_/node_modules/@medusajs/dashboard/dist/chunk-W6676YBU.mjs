import {
  DateCell
} from "./chunk-WYX5PIA3.mjs";
import {
  TextCell
} from "./chunk-MSDRGCRR.mjs";

// src/hooks/table/columns/use-product-tag-table-columns.tsx
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { jsx } from "react/jsx-runtime";
var columnHelper = createColumnHelper();
var useProductTagTableColumns = () => {
  const { t } = useTranslation();
  return useMemo(
    () => [
      columnHelper.accessor("value", {
        header: () => t("fields.value"),
        cell: ({ getValue }) => /* @__PURE__ */ jsx(TextCell, { text: getValue() })
      }),
      columnHelper.accessor("created_at", {
        header: () => t("fields.createdAt"),
        cell: ({ getValue }) => {
          return /* @__PURE__ */ jsx(DateCell, { date: getValue() });
        }
      }),
      columnHelper.accessor("updated_at", {
        header: () => t("fields.updatedAt"),
        cell: ({ getValue }) => {
          return /* @__PURE__ */ jsx(DateCell, { date: getValue() });
        }
      })
    ],
    [t]
  );
};

// src/hooks/table/columns/use-return-reason-table-columns.tsx
import { Badge } from "@medusajs/ui";
import { createColumnHelper as createColumnHelper2 } from "@tanstack/react-table";
import { useMemo as useMemo2 } from "react";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var columnHelper2 = createColumnHelper2();
var useReturnReasonTableColumns = () => {
  return useMemo2(
    () => [
      columnHelper2.accessor("value", {
        cell: ({ getValue }) => /* @__PURE__ */ jsx2(Badge, { size: "2xsmall", children: getValue() })
      }),
      columnHelper2.accessor("label", {
        cell: ({ row }) => {
          const { label, description } = row.original;
          return /* @__PURE__ */ jsx2("div", { className: " py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex h-full w-full flex-col justify-center", children: [
            /* @__PURE__ */ jsx2("span", { className: "truncate font-medium", children: label }),
            /* @__PURE__ */ jsx2("span", { className: "truncate", children: description ? description : "-" })
          ] }) });
        }
      })
    ],
    []
  );
};

// src/hooks/table/columns/use-tax-rates-table-columns.tsx
import { createColumnHelper as createColumnHelper3 } from "@tanstack/react-table";
import { useMemo as useMemo3 } from "react";
import { useTranslation as useTranslation2 } from "react-i18next";

// src/components/table/table-cells/taxes/type-cell/type-cell.tsx
import { Badge as Badge2 } from "@medusajs/ui";
import { jsx as jsx3 } from "react/jsx-runtime";

// src/hooks/table/columns/use-tax-rates-table-columns.tsx
import { jsx as jsx4 } from "react/jsx-runtime";
var columnHelper3 = createColumnHelper3();

export {
  useProductTagTableColumns,
  useReturnReasonTableColumns
};
