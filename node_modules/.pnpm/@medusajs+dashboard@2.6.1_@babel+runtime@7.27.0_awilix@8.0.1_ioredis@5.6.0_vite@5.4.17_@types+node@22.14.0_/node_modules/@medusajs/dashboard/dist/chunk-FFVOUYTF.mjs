import {
  useDate
} from "./chunk-DV5RB7II.mjs";

// src/components/data-table/helpers/general/use-data-table-date-columns.tsx
import {
  createDataTableColumnHelper,
  Tooltip
} from "@medusajs/ui";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { jsx } from "react/jsx-runtime";
var columnHelper = createDataTableColumnHelper();
var useDataTableDateColumns = () => {
  const { t } = useTranslation();
  const { getFullDate } = useDate();
  return useMemo(() => {
    return [
      columnHelper.accessor("created_at", {
        header: t("fields.createdAt"),
        cell: ({ row }) => {
          return /* @__PURE__ */ jsx(
            Tooltip,
            {
              content: getFullDate({
                date: row.original.created_at,
                includeTime: true
              }),
              children: /* @__PURE__ */ jsx("span", { children: getFullDate({ date: row.original.created_at }) })
            }
          );
        },
        enableSorting: true,
        sortAscLabel: t("filters.sorting.dateAsc"),
        sortDescLabel: t("filters.sorting.dateDesc")
      }),
      columnHelper.accessor("updated_at", {
        header: t("fields.updatedAt"),
        cell: ({ row }) => {
          return /* @__PURE__ */ jsx(
            Tooltip,
            {
              content: getFullDate({
                date: row.original.updated_at,
                includeTime: true
              }),
              children: /* @__PURE__ */ jsx("span", { children: getFullDate({ date: row.original.updated_at }) })
            }
          );
        },
        enableSorting: true,
        sortAscLabel: t("filters.sorting.dateAsc"),
        sortDescLabel: t("filters.sorting.dateDesc")
      })
    ];
  }, [t, getFullDate]);
};

export {
  useDataTableDateColumns
};
