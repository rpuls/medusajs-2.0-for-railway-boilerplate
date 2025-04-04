import {
  TextCell,
  TextHeader
} from "./chunk-MSDRGCRR.mjs";

// src/hooks/table/columns/use-customer-group-table-columns.tsx
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { jsx } from "react/jsx-runtime";
var columnHelper = createColumnHelper();
var useCustomerGroupTableColumns = () => {
  const { t } = useTranslation();
  return useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => /* @__PURE__ */ jsx(TextHeader, { text: t("fields.name") }),
        cell: ({ getValue }) => /* @__PURE__ */ jsx(TextCell, { text: getValue() || "-" })
      }),
      columnHelper.accessor("customers", {
        header: () => /* @__PURE__ */ jsx(TextHeader, { text: t("customers.domain") }),
        cell: ({ getValue }) => {
          const count = getValue()?.length ?? 0;
          return /* @__PURE__ */ jsx(TextCell, { text: count });
        }
      })
    ],
    [t]
  );
};

export {
  useCustomerGroupTableColumns
};
