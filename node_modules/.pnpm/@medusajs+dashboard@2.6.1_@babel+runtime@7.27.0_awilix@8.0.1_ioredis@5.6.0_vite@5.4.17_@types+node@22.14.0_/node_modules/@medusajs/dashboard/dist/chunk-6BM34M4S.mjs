import {
  useCustomerGroupTableColumns
} from "./chunk-ZJRFL6ZN.mjs";
import {
  _DataTable,
  useDataTable
} from "./chunk-X3LH6P65.mjs";
import {
  useCustomerGroupTableQuery
} from "./chunk-MOSRJHJ3.mjs";
import {
  useCustomerGroupTableFilters
} from "./chunk-DLZWPHHO.mjs";
import {
  useCustomerGroups
} from "./chunk-S3MWIWV4.mjs";
import {
  StackedDrawer,
  StackedFocusModal
} from "./chunk-JGQGO74V.mjs";

// src/routes/price-lists/common/components/price-list-customer-group-rule-form/price-list-customer-group-rule-form.tsx
import { Button, Checkbox } from "@medusajs/ui";
import { keepPreviousData } from "@tanstack/react-query";
import {
  createColumnHelper
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { jsx, jsxs } from "react/jsx-runtime";
var PAGE_SIZE = 50;
var PREFIX = "cg";
var initRowSelection = (state) => {
  return state.reduce((acc, group) => {
    acc[group.id] = true;
    return acc;
  }, {});
};
var PriceListCustomerGroupRuleForm = ({
  state,
  setState,
  type
}) => {
  const { t } = useTranslation();
  const [rowSelection, setRowSelection] = useState(
    initRowSelection(state)
  );
  const [intermediate, setIntermediate] = useState(state);
  useEffect(() => {
    setRowSelection(initRowSelection(state));
    setIntermediate(state);
  }, [state]);
  const { searchParams, raw } = useCustomerGroupTableQuery({
    pageSize: PAGE_SIZE,
    prefix: PREFIX
  });
  const { customer_groups, count, isLoading, isError, error } = useCustomerGroups(
    { ...searchParams, fields: "id,name,customers.id" },
    {
      placeholderData: keepPreviousData
    }
  );
  const updater = (value) => {
    const state2 = typeof value === "function" ? value(rowSelection) : value;
    const currentIds = Object.keys(rowSelection);
    const ids = Object.keys(state2);
    const newIds = ids.filter((id) => !currentIds.includes(id));
    const removedIds = currentIds.filter((id) => !ids.includes(id));
    const newCustomerGroups = customer_groups?.filter((cg) => newIds.includes(cg.id)).map((cg) => ({ id: cg.id, name: cg.name })) || [];
    const filteredIntermediate = intermediate.filter(
      (cg) => !removedIds.includes(cg.id)
    );
    setIntermediate([...filteredIntermediate, ...newCustomerGroups]);
    setRowSelection(state2);
  };
  const handleSave = () => {
    setState(intermediate);
  };
  const filters = useCustomerGroupTableFilters();
  const columns = useColumns();
  const { table } = useDataTable({
    data: customer_groups || [],
    columns,
    count,
    enablePagination: true,
    enableRowSelection: true,
    getRowId: (row) => row.id,
    rowSelection: {
      state: rowSelection,
      updater
    },
    pageSize: PAGE_SIZE,
    prefix: PREFIX
  });
  const Component = type === "focus" ? StackedFocusModal : StackedDrawer;
  if (isError) {
    throw error;
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex size-full flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsx(Component.Body, { className: "min-h-0 p-0", children: /* @__PURE__ */ jsx(
      _DataTable,
      {
        table,
        columns,
        pageSize: PAGE_SIZE,
        count,
        isLoading,
        filters,
        orderBy: [
          { key: "name", label: t("fields.name") },
          { key: "created_at", label: t("fields.createdAt") },
          { key: "updated_at", label: t("fields.updatedAt") }
        ],
        layout: "fill",
        pagination: true,
        search: true,
        prefix: PREFIX,
        queryObject: raw
      }
    ) }),
    /* @__PURE__ */ jsxs(Component.Footer, { children: [
      /* @__PURE__ */ jsx(Component.Close, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "small", type: "button", children: t("actions.cancel") }) }),
      /* @__PURE__ */ jsx(Button, { type: "button", size: "small", onClick: handleSave, children: t("actions.save") })
    ] })
  ] });
};
var columnHelper = createColumnHelper();
var useColumns = () => {
  const base = useCustomerGroupTableColumns();
  return useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => {
          return /* @__PURE__ */ jsx(
            Checkbox,
            {
              checked: table.getIsSomePageRowsSelected() ? "indeterminate" : table.getIsAllPageRowsSelected(),
              onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value)
            }
          );
        },
        cell: ({ row }) => {
          return /* @__PURE__ */ jsx(
            Checkbox,
            {
              checked: row.getIsSelected(),
              onCheckedChange: (value) => row.toggleSelected(!!value),
              onClick: (e) => {
                e.stopPropagation();
              }
            }
          );
        }
      }),
      ...base
    ],
    [base]
  );
};

export {
  PriceListCustomerGroupRuleForm
};
