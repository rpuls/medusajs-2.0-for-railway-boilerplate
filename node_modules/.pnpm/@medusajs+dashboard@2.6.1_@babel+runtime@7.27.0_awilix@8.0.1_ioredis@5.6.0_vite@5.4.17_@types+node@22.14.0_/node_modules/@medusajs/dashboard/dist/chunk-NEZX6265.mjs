import {
  TextCell,
  TextHeader
} from "./chunk-MSDRGCRR.mjs";
import {
  useQueryParams
} from "./chunk-C76H5USB.mjs";

// src/routes/store/common/hooks/use-currencies-table-columns.tsx
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { jsx } from "react/jsx-runtime";
var columnHelper = createColumnHelper();
var useCurrenciesTableColumns = () => {
  const { t } = useTranslation();
  return useMemo(
    () => [
      columnHelper.accessor("code", {
        header: () => /* @__PURE__ */ jsx(TextHeader, { text: t("fields.code") }),
        cell: ({ getValue }) => /* @__PURE__ */ jsx(TextCell, { text: getValue().toUpperCase() })
      }),
      columnHelper.accessor("name", {
        header: () => /* @__PURE__ */ jsx(TextHeader, { text: t("fields.name") }),
        cell: ({ getValue }) => /* @__PURE__ */ jsx(TextCell, { text: getValue() })
      })
    ],
    [t]
  );
};

// src/routes/store/common/hooks/use-currencies-table-query.tsx
var useCurrenciesTableQuery = ({
  pageSize = 10,
  prefix
}) => {
  const raw = useQueryParams(["order", "q", "offset"], prefix);
  const { offset, ...rest } = raw;
  const searchParams = {
    limit: pageSize,
    offset: offset ? parseInt(offset) : 0,
    ...rest
  };
  return { searchParams, raw };
};

export {
  useCurrenciesTableColumns,
  useCurrenciesTableQuery
};
