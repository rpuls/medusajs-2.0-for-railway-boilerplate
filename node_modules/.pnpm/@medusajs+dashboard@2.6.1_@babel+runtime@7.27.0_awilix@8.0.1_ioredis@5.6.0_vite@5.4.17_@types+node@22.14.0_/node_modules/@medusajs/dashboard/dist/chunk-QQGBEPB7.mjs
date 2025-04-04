import {
  DateCell
} from "./chunk-WYX5PIA3.mjs";
import {
  TextCell
} from "./chunk-MSDRGCRR.mjs";

// src/hooks/table/columns/use-product-type-table-columns.tsx
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { jsx } from "react/jsx-runtime";
var columnHelper = createColumnHelper();
var useProductTypeTableColumns = () => {
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

export {
  useProductTypeTableColumns
};
