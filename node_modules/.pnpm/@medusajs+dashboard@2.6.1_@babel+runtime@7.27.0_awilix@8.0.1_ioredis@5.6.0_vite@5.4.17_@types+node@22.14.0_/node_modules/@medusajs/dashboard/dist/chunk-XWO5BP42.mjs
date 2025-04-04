import {
  TextCell
} from "./chunk-MSDRGCRR.mjs";

// src/hooks/table/columns/use-collection-table-columns.tsx
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { jsx } from "react/jsx-runtime";
var columnHelper = createColumnHelper();
var useCollectionTableColumns = () => {
  const { t } = useTranslation();
  return useMemo(
    () => [
      columnHelper.accessor("title", {
        header: t("fields.title"),
        cell: ({ getValue }) => /* @__PURE__ */ jsx(TextCell, { text: getValue() })
      }),
      columnHelper.accessor("handle", {
        header: t("fields.handle"),
        cell: ({ getValue }) => /* @__PURE__ */ jsx(TextCell, { text: `/${getValue()}` })
      }),
      columnHelper.accessor("products", {
        header: t("fields.products"),
        cell: ({ getValue }) => {
          const count = getValue()?.length || void 0;
          return /* @__PURE__ */ jsx(TextCell, { text: count });
        }
      })
    ],
    [t]
  );
};

export {
  useCollectionTableColumns
};
