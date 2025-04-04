import {
  getPromotionStatus
} from "./chunk-6LRPF7MX.mjs";
import {
  TextCell,
  TextHeader
} from "./chunk-MSDRGCRR.mjs";
import {
  StatusCell
} from "./chunk-ADOCJB6L.mjs";
import {
  useQueryParams
} from "./chunk-C76H5USB.mjs";

// src/hooks/table/columns/use-promotion-table-columns.tsx
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

// src/components/table/table-cells/common/code-cell/code-cell.tsx
import { Badge } from "@medusajs/ui";
import { jsx } from "react/jsx-runtime";
var CodeCell = ({ code }) => {
  return /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center gap-x-3 overflow-hidden", children: /* @__PURE__ */ jsx(Badge, { size: "2xsmall", className: "truncate", children: code }) });
};
var CodeHeader = ({ text }) => {
  return /* @__PURE__ */ jsx("div", { className: " flex h-full w-full items-center ", children: /* @__PURE__ */ jsx("span", { children: text }) });
};

// src/components/table/table-cells/promotion/status-cell/status-cell.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
var StatusCell2 = ({ promotion }) => {
  const [color, text] = getPromotionStatus(promotion);
  return /* @__PURE__ */ jsx2(StatusCell, { color, children: text });
};

// src/hooks/table/columns/use-promotion-table-columns.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
var columnHelper = createColumnHelper();
var usePromotionTableColumns = () => {
  const { t } = useTranslation();
  return useMemo(
    () => [
      columnHelper.display({
        id: "code",
        header: () => /* @__PURE__ */ jsx3(CodeHeader, { text: t("fields.code") }),
        cell: ({ row }) => /* @__PURE__ */ jsx3(CodeCell, { code: row.original.code })
      }),
      columnHelper.display({
        id: "method",
        header: () => /* @__PURE__ */ jsx3(TextHeader, { text: t("promotions.fields.method") }),
        cell: ({ row }) => {
          const text = row.original.is_automatic ? t("promotions.form.method.automatic.title") : t("promotions.form.method.code.title");
          return /* @__PURE__ */ jsx3(TextCell, { text });
        }
      }),
      columnHelper.display({
        id: "status",
        header: () => /* @__PURE__ */ jsx3(TextHeader, { text: t("fields.status") }),
        cell: ({ row }) => /* @__PURE__ */ jsx3(StatusCell2, { promotion: row.original })
      })
    ],
    [t]
  );
};

// src/hooks/table/query/use-promotion-table-query.tsx
var usePromotionTableQuery = ({
  prefix,
  pageSize = 20
}) => {
  const queryObject = useQueryParams(
    ["offset", "q", "created_at", "updated_at"],
    prefix
  );
  const { offset, q, created_at, updated_at } = queryObject;
  const searchParams = {
    limit: pageSize,
    created_at: created_at ? JSON.parse(created_at) : void 0,
    updated_at: updated_at ? JSON.parse(updated_at) : void 0,
    offset: offset ? Number(offset) : 0,
    q
  };
  return {
    searchParams,
    raw: queryObject
  };
};

export {
  usePromotionTableColumns,
  usePromotionTableQuery
};
