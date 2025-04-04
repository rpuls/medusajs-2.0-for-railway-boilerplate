import {
  LocalizedTablePagination,
  TaxRegionCard
} from "./chunk-JHNHXN7U.mjs";
import {
  DataTableOrderBy
} from "./chunk-AOFGTNG6.mjs";
import {
  NoRecords,
  NoResults
} from "./chunk-WX2SMNCD.mjs";
import {
  TableFooterSkeleton
} from "./chunk-LPEUYMRK.mjs";

// src/routes/tax-regions/common/components/tax-region-table/tax-region-table.tsx
import { Button } from "@medusajs/ui";
import { Link } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
var TaxRegionTable = ({
  variant = "country",
  isPending,
  action,
  count = 0,
  table,
  queryObject,
  prefix,
  children
}) => {
  if (isPending) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col divide-y", children: [
      Array.from({ length: 3 }).map((_, index) => {
        return /* @__PURE__ */ jsx(
          "div",
          {
            className: "bg-ui-bg-field-component h-[52px] w-full animate-pulse"
          },
          index
        );
      }),
      /* @__PURE__ */ jsx(TableFooterSkeleton, { layout: "fit" })
    ] });
  }
  const noQuery = Object.values(queryObject).filter((v) => Boolean(v)).length === 0;
  const noResults = !isPending && count === 0 && !noQuery;
  const noRecords = !isPending && count === 0 && noQuery;
  const { pageIndex, pageSize } = table.getState().pagination;
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col divide-y", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between gap-x-4 gap-y-3 px-6 py-4 md:flex-row md:items-center", children: [
      /* @__PURE__ */ jsx("div", { children }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-x-2", children: [
        !noRecords && /* @__PURE__ */ jsx("div", { className: "flex w-full items-center gap-x-2 md:w-fit", children: /* @__PURE__ */ jsx(
          DataTableOrderBy,
          {
            keys: ["updated_at", "created_at"],
            prefix
          }
        ) }),
        /* @__PURE__ */ jsx(Link, { to: action.to, children: /* @__PURE__ */ jsx(Button, { size: "small", variant: "secondary", children: action.label }) })
      ] })
    ] }),
    noResults && /* @__PURE__ */ jsx(NoResults, {}),
    noRecords && /* @__PURE__ */ jsx(NoRecords, {}),
    !noRecords && !noResults ? !isPending ? table.getRowModel().rows.map((row) => {
      return /* @__PURE__ */ jsx(
        TaxRegionCard,
        {
          variant,
          taxRegion: row.original,
          role: "row",
          "aria-rowindex": row.index
        },
        row.id
      );
    }) : Array.from({ length: 3 }).map((_, index) => {
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: "bg-ui-bg-field-component h-[60px] w-full animate-pulse"
        },
        index
      );
    }) : null,
    !noRecords && /* @__PURE__ */ jsx(
      LocalizedTablePagination,
      {
        prefix,
        canNextPage: table.getCanNextPage(),
        canPreviousPage: table.getCanPreviousPage(),
        count,
        nextPage: table.nextPage,
        previousPage: table.previousPage,
        pageCount: table.getPageCount(),
        pageIndex,
        pageSize
      }
    )
  ] });
};

// src/routes/tax-regions/common/hooks/use-tax-region-table.tsx
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
var useTaxRegionTable = ({
  data = [],
  count = 0,
  pageSize: _pageSize = 10,
  prefix
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const offsetKey = `${prefix ? `${prefix}_` : ""}offset`;
  const offset = searchParams.get(offsetKey);
  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: offset ? Math.ceil(Number(offset) / _pageSize) : 0,
    pageSize: _pageSize
  });
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize
    }),
    [pageIndex, pageSize]
  );
  useEffect(() => {
    const index = offset ? Math.ceil(Number(offset) / _pageSize) : 0;
    if (index === pageIndex) {
      return;
    }
    setPagination((prev) => ({
      ...prev,
      pageIndex: index
    }));
  }, [offset, _pageSize, pageIndex]);
  const onPaginationChange = (updater) => {
    const state = updater(pagination);
    const { pageIndex: pageIndex2, pageSize: pageSize2 } = state;
    setSearchParams((prev) => {
      if (!pageIndex2) {
        prev.delete(offsetKey);
        return prev;
      }
      const newSearch = new URLSearchParams(prev);
      newSearch.set(offsetKey, String(pageIndex2 * pageSize2));
      return newSearch;
    });
    setPagination(state);
    return state;
  };
  const table = useReactTable({
    data,
    columns: [],
    // We don't actually want to render any columns
    pageCount: Math.ceil(count / pageSize),
    state: {
      pagination
    },
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange,
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true
  });
  return {
    table
  };
};

export {
  TaxRegionTable,
  useTaxRegionTable
};
