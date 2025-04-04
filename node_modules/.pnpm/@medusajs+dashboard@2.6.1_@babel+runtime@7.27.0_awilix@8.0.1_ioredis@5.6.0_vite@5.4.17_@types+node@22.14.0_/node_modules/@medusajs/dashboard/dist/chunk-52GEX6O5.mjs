import {
  TaxRateRuleReferenceType
} from "./chunk-V3MOBCDF.mjs";
import {
  useProductTagTableColumns
} from "./chunk-W6676YBU.mjs";
import {
  useProductTypeTableColumns
} from "./chunk-QQGBEPB7.mjs";
import {
  useCustomerGroupTableColumns
} from "./chunk-ZJRFL6ZN.mjs";
import {
  useCollectionTableColumns
} from "./chunk-XWO5BP42.mjs";
import {
  useProductTableColumns
} from "./chunk-G3QXMPRB.mjs";
import {
  _DataTable,
  useDataTable
} from "./chunk-X3LH6P65.mjs";
import {
  useCollectionTableQuery,
  useProductTagTableQuery
} from "./chunk-EMNHBSFU.mjs";
import {
  useProductTypeTableQuery
} from "./chunk-TDK3JDOB.mjs";
import {
  useCollectionTableFilters,
  useProductTagTableFilters
} from "./chunk-GW6TVOAA.mjs";
import {
  useProductTypeTableFilters
} from "./chunk-CBSCX7RE.mjs";
import {
  useCustomerGroupTableQuery
} from "./chunk-MOSRJHJ3.mjs";
import {
  useCustomerGroupTableFilters
} from "./chunk-DLZWPHHO.mjs";
import {
  useProductTableQuery
} from "./chunk-Y2ZAIM5S.mjs";
import {
  useProductTableFilters
} from "./chunk-U6CSGYH6.mjs";
import {
  useProductTags
} from "./chunk-XCF3TZQZ.mjs";
import {
  useProductTypes
} from "./chunk-S4HBRQEC.mjs";
import {
  useCustomerGroups
} from "./chunk-S3MWIWV4.mjs";
import {
  useCollections
} from "./chunk-2BXI62DA.mjs";
import {
  StackedDrawer,
  StackedFocusModal
} from "./chunk-JGQGO74V.mjs";
import {
  useProducts
} from "./chunk-KPNKJVW6.mjs";

// src/routes/tax-regions/common/components/target-form/target-form.tsx
import { Button, Checkbox } from "@medusajs/ui";
import { keepPreviousData } from "@tanstack/react-query";
import {
  createColumnHelper
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
function initRowSelection(state) {
  return state.reduce((acc, reference) => {
    acc[reference.value] = true;
    return acc;
  }, {});
}
var TargetForm = ({
  referenceType,
  type,
  setState,
  state
}) => {
  const { t } = useTranslation();
  const Component = type === "focus" ? StackedFocusModal : StackedDrawer;
  const [intermediate, setIntermediate] = useState(state);
  const handleSave = () => {
    setState(intermediate);
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex size-full flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsx(Component.Body, { className: "min-h-0 p-0", children: /* @__PURE__ */ jsx(
      Table,
      {
        referenceType,
        initialRowState: initRowSelection(state),
        intermediate,
        setIntermediate
      }
    ) }),
    /* @__PURE__ */ jsxs(Component.Footer, { children: [
      /* @__PURE__ */ jsx(Component.Close, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "secondary", size: "small", type: "button", children: t("actions.cancel") }) }),
      /* @__PURE__ */ jsx(Button, { type: "button", size: "small", onClick: handleSave, children: t("actions.save") })
    ] })
  ] });
};
var Table = ({ referenceType, ...props }) => {
  switch (referenceType) {
    case TaxRateRuleReferenceType.CUSTOMER_GROUP:
      return /* @__PURE__ */ jsx(CustomerGroupTable, { ...props });
    case "product" /* PRODUCT */:
      return /* @__PURE__ */ jsx(ProductTable, { ...props });
    case TaxRateRuleReferenceType.PRODUCT_COLLECTION:
      return /* @__PURE__ */ jsx(ProductCollectionTable, { ...props });
    case "product_type" /* PRODUCT_TYPE */:
      return /* @__PURE__ */ jsx(ProductTypeTable, { ...props });
    case TaxRateRuleReferenceType.PRODUCT_TAG:
      return /* @__PURE__ */ jsx(ProductTagTable, { ...props });
    default:
      return null;
  }
};
var PAGE_SIZE = 50;
var PREFIX_CUSTOMER_GROUP = "cg";
var CustomerGroupTable = ({
  initialRowState,
  intermediate,
  setIntermediate
}) => {
  const { t } = useTranslation();
  const [rowSelection, setRowSelection] = useState(initialRowState);
  useCleanupSearchParams();
  const { searchParams, raw } = useCustomerGroupTableQuery({
    pageSize: PAGE_SIZE,
    prefix: PREFIX_CUSTOMER_GROUP
  });
  const { customer_groups, count, isLoading, isError, error } = useCustomerGroups(searchParams, {
    placeholderData: keepPreviousData
  });
  const updater = (value) => {
    const state = typeof value === "function" ? value(rowSelection) : value;
    const currentIds = Object.keys(rowSelection);
    const ids = Object.keys(state);
    const newIds = ids.filter((id) => !currentIds.includes(id));
    const removedIds = currentIds.filter((id) => !ids.includes(id));
    const newCustomerGroups = customer_groups?.filter((cg) => newIds.includes(cg.id)).map((cg) => ({ value: cg.id, label: cg.name })) || [];
    const filteredIntermediate = intermediate.filter(
      (cg) => !removedIds.includes(cg.value)
    );
    setIntermediate([...filteredIntermediate, ...newCustomerGroups]);
    setRowSelection(state);
  };
  const filters = useCustomerGroupTableFilters();
  const columns = useGroupColumns();
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
    prefix: PREFIX_CUSTOMER_GROUP
  });
  if (isError) {
    throw error;
  }
  return /* @__PURE__ */ jsx(
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
      prefix: PREFIX_CUSTOMER_GROUP,
      queryObject: raw
    }
  );
};
var cgColumnHelper = createColumnHelper();
var useGroupColumns = () => {
  const base = useCustomerGroupTableColumns();
  return useMemo(
    () => [
      cgColumnHelper.display({
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
var PREFIX_PRODUCT = "p";
var ProductTable = ({
  initialRowState,
  intermediate,
  setIntermediate
}) => {
  const { t } = useTranslation();
  const [rowSelection, setRowSelection] = useState(initialRowState);
  useCleanupSearchParams();
  const { searchParams, raw } = useProductTableQuery({
    pageSize: PAGE_SIZE,
    prefix: PREFIX_PRODUCT
  });
  const { products, count, isLoading, isError, error } = useProducts(
    searchParams,
    {
      placeholderData: keepPreviousData
    }
  );
  const updater = (value) => {
    const state = typeof value === "function" ? value(rowSelection) : value;
    const currentIds = Object.keys(rowSelection);
    const ids = Object.keys(state);
    const newIds = ids.filter((id) => !currentIds.includes(id));
    const removedIds = currentIds.filter((id) => !ids.includes(id));
    const newProducts = products?.filter((p) => newIds.includes(p.id)).map((p) => ({
      value: p.id,
      label: p.title
    })) || [];
    const filteredIntermediate = intermediate.filter(
      (p) => !removedIds.includes(p.value)
    );
    setIntermediate([...filteredIntermediate, ...newProducts]);
    setRowSelection(state);
  };
  const filters = useProductTableFilters();
  const columns = useProductColumns();
  const { table } = useDataTable({
    data: products || [],
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
    prefix: PREFIX_PRODUCT
  });
  if (isError) {
    throw error;
  }
  return /* @__PURE__ */ jsx(
    _DataTable,
    {
      table,
      columns,
      pageSize: PAGE_SIZE,
      count,
      isLoading,
      filters,
      orderBy: [
        { key: "title", label: t("fields.title") },
        { key: "created_at", label: t("fields.createdAt") },
        { key: "updated_at", label: t("fields.updatedAt") }
      ],
      layout: "fill",
      pagination: true,
      search: true,
      prefix: PREFIX_PRODUCT,
      queryObject: raw
    }
  );
};
var pColumnHelper = createColumnHelper();
var useProductColumns = () => {
  const base = useProductTableColumns();
  return useMemo(
    () => [
      pColumnHelper.display({
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
var PREFIX_PRODUCT_COLLECTION = "pc";
var ProductCollectionTable = ({
  initialRowState,
  intermediate,
  setIntermediate
}) => {
  const { t } = useTranslation();
  const [rowSelection, setRowSelection] = useState(initialRowState);
  useCleanupSearchParams();
  const { searchParams, raw } = useCollectionTableQuery({
    pageSize: PAGE_SIZE,
    prefix: PREFIX_PRODUCT_COLLECTION
  });
  const { collections, count, isLoading, isError, error } = useCollections(
    searchParams,
    {
      placeholderData: keepPreviousData
    }
  );
  const updater = (value) => {
    const state = typeof value === "function" ? value(rowSelection) : value;
    const currentIds = Object.keys(rowSelection);
    const ids = Object.keys(state);
    const newIds = ids.filter((id) => !currentIds.includes(id));
    const removedIds = currentIds.filter((id) => !ids.includes(id));
    const newCollections = collections?.filter((p) => newIds.includes(p.id)).map((p) => ({
      value: p.id,
      label: p.title
    })) || [];
    const filteredIntermediate = intermediate.filter(
      (p) => !removedIds.includes(p.value)
    );
    setIntermediate([...filteredIntermediate, ...newCollections]);
    setRowSelection(state);
  };
  const filters = useCollectionTableFilters();
  const columns = useCollectionColumns();
  const { table } = useDataTable({
    data: collections || [],
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
    prefix: PREFIX_PRODUCT_COLLECTION
  });
  if (isError) {
    throw error;
  }
  return /* @__PURE__ */ jsx(
    _DataTable,
    {
      table,
      columns,
      pageSize: PAGE_SIZE,
      count,
      isLoading,
      filters,
      orderBy: [
        { key: "title", label: t("fields.title") },
        { key: "created_at", label: t("fields.createdAt") },
        { key: "updated_at", label: t("fields.updatedAt") }
      ],
      layout: "fill",
      pagination: true,
      search: true,
      prefix: PREFIX_PRODUCT_COLLECTION,
      queryObject: raw
    }
  );
};
var pcColumnHelper = createColumnHelper();
var useCollectionColumns = () => {
  const base = useCollectionTableColumns();
  return useMemo(
    () => [
      pcColumnHelper.display({
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
var PREFIX_PRODUCT_TYPE = "pt";
var ProductTypeTable = ({
  initialRowState,
  intermediate,
  setIntermediate
}) => {
  const { t } = useTranslation();
  const [rowSelection, setRowSelection] = useState(initialRowState);
  useCleanupSearchParams();
  const { searchParams, raw } = useProductTypeTableQuery({
    pageSize: PAGE_SIZE,
    prefix: PREFIX_PRODUCT_TYPE
  });
  const { product_types, count, isLoading, isError, error } = useProductTypes(
    searchParams,
    {
      placeholderData: keepPreviousData
    }
  );
  const updater = (value) => {
    const state = typeof value === "function" ? value(rowSelection) : value;
    const currentIds = Object.keys(rowSelection);
    const ids = Object.keys(state);
    const newIds = ids.filter((id) => !currentIds.includes(id));
    const removedIds = currentIds.filter((id) => !ids.includes(id));
    const newTypes = product_types?.filter((p) => newIds.includes(p.id)).map((p) => ({
      value: p.id,
      label: p.value
    })) || [];
    const filteredIntermediate = intermediate.filter(
      (p) => !removedIds.includes(p.value)
    );
    setIntermediate([...filteredIntermediate, ...newTypes]);
    setRowSelection(state);
  };
  const filters = useProductTypeTableFilters();
  const columns = useProductTypeColumns();
  const { table } = useDataTable({
    data: product_types || [],
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
    prefix: PREFIX_PRODUCT_TYPE
  });
  if (isError) {
    throw error;
  }
  return /* @__PURE__ */ jsx(
    _DataTable,
    {
      table,
      columns,
      pageSize: PAGE_SIZE,
      count,
      isLoading,
      filters,
      orderBy: [
        { key: "value", label: t("fields.value") },
        { key: "created_at", label: t("fields.createdAt") },
        { key: "updated_at", label: t("fields.updatedAt") }
      ],
      layout: "fill",
      pagination: true,
      search: true,
      prefix: PREFIX_PRODUCT_TYPE,
      queryObject: raw
    }
  );
};
var ptColumnHelper = createColumnHelper();
var useProductTypeColumns = () => {
  const base = useProductTypeTableColumns();
  return useMemo(
    () => [
      ptColumnHelper.display({
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
var PREFIX_PRODUCT_TAG = "ptag";
var ProductTagTable = ({
  initialRowState,
  intermediate,
  setIntermediate
}) => {
  const { t } = useTranslation();
  const [rowSelection, setRowSelection] = useState(initialRowState);
  useCleanupSearchParams();
  const { searchParams, raw } = useProductTagTableQuery({
    pageSize: PAGE_SIZE,
    prefix: PREFIX_PRODUCT_TAG
  });
  const { product_tags, count, isLoading, isError, error } = useProductTags(
    searchParams,
    {
      placeholderData: keepPreviousData
    }
  );
  const updater = (value) => {
    const state = typeof value === "function" ? value(rowSelection) : value;
    const currentIds = Object.keys(rowSelection);
    const ids = Object.keys(state);
    const newIds = ids.filter((id) => !currentIds.includes(id));
    const removedIds = currentIds.filter((id) => !ids.includes(id));
    const newTags = product_tags?.filter((p) => newIds.includes(p.id)).map((p) => ({
      value: p.id,
      label: p.value
    })) || [];
    const filteredIntermediate = intermediate.filter(
      (p) => !removedIds.includes(p.value)
    );
    setIntermediate([...filteredIntermediate, ...newTags]);
    setRowSelection(state);
  };
  const filters = useProductTagTableFilters();
  const columns = useProductTagColumns();
  const { table } = useDataTable({
    data: product_tags || [],
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
    prefix: PREFIX_PRODUCT_TAG
  });
  if (isError) {
    throw error;
  }
  return /* @__PURE__ */ jsx(
    _DataTable,
    {
      table,
      columns,
      pageSize: PAGE_SIZE,
      count,
      isLoading,
      filters,
      orderBy: [
        { key: "value", label: t("fields.value") },
        { key: "created_at", label: t("fields.createdAt") },
        { key: "updated_at", label: t("fields.updatedAt") }
      ],
      layout: "fill",
      pagination: true,
      search: true,
      prefix: PREFIX_PRODUCT_TAG,
      queryObject: raw
    }
  );
};
var ptagColumnHelper = createColumnHelper();
var useProductTagColumns = () => {
  const base = useProductTagTableColumns();
  return useMemo(
    () => [
      ptagColumnHelper.display({
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
var useCleanupSearchParams = () => {
  const [_, setSearchParams] = useSearchParams();
  useEffect(() => {
    return () => {
      setSearchParams({});
    };
  }, []);
};

// src/routes/tax-regions/common/components/target-item/target-item.tsx
import { XMarkMini } from "@medusajs/icons";
import { IconButton, Text } from "@medusajs/ui";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var TargetItem = ({ index, label, onRemove }) => {
  return /* @__PURE__ */ jsxs2("div", { className: "bg-ui-bg-field-component shadow-borders-base flex items-center justify-between gap-2 rounded-md px-2 py-0.5", children: [
    /* @__PURE__ */ jsx2(Text, { size: "small", leading: "compact", children: label }),
    /* @__PURE__ */ jsx2(
      IconButton,
      {
        size: "small",
        variant: "transparent",
        type: "button",
        onClick: () => onRemove(index),
        children: /* @__PURE__ */ jsx2(XMarkMini, {})
      }
    )
  ] });
};

// src/routes/tax-regions/common/schemas.ts
import { z } from "zod";
var TaxRateRuleReferenceSchema = z.object({
  value: z.string(),
  label: z.string()
});
var TaxRateRuleTargetSchema = z.object({
  reference_type: z.nativeEnum(TaxRateRuleReferenceType),
  references: z.array(TaxRateRuleReferenceSchema)
});

// src/routes/tax-regions/common/utils.ts
var createTaxRulePayload = (target) => {
  return target.references.map((reference) => ({
    reference: target.reference_type,
    reference_id: reference.value
  }));
};

export {
  TargetForm,
  TargetItem,
  TaxRateRuleReferenceSchema,
  createTaxRulePayload
};
