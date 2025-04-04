import {
  DataTableSearch
} from "./chunk-YEDAFXMB.mjs";
import {
  DataTableOrderBy
} from "./chunk-AOFGTNG6.mjs";
import {
  NoRecords,
  NoResults
} from "./chunk-WX2SMNCD.mjs";
import {
  DataTableFilter
} from "./chunk-TMAS4ILY.mjs";
import {
  TableSkeleton
} from "./chunk-LPEUYMRK.mjs";

// src/components/table/data-table/data-table.tsx
import { clx as clx2 } from "@medusajs/ui";
import { memo } from "react";

// src/components/table/data-table/data-table-query/data-table-query.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var DataTableQuery = ({
  search,
  orderBy,
  filters,
  prefix
}) => {
  return (search || orderBy || filters || prefix) && /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-x-4 px-6 py-4", children: [
    /* @__PURE__ */ jsx("div", { className: "w-full max-w-[60%]", children: filters && filters.length > 0 && /* @__PURE__ */ jsx(DataTableFilter, { filters, prefix }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center gap-x-2", children: [
      search && /* @__PURE__ */ jsx(
        DataTableSearch,
        {
          prefix,
          autofocus: search === "autofocus"
        }
      ),
      orderBy && /* @__PURE__ */ jsx(DataTableOrderBy, { keys: orderBy, prefix })
    ] })
  ] });
};

// src/components/table/data-table/data-table-root/data-table-root.tsx
import { CommandBar, Table, clx } from "@medusajs/ui";
import {
  flexRender
} from "@tanstack/react-table";
import {
  Fragment,
  useEffect,
  useRef,
  useState
} from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var DataTableRoot = ({
  table,
  columns,
  pagination,
  navigateTo,
  commands,
  count = 0,
  noResults = false,
  noHeader = false,
  layout = "fit"
}) => {
  const { t } = useTranslation();
  const [showStickyBorder, setShowStickyBorder] = useState(false);
  const scrollableRef = useRef(null);
  const hasSelect = columns.find((c) => c.id === "select");
  const hasActions = columns.find((c) => c.id === "actions");
  const hasCommandBar = commands && commands.length > 0;
  const rowSelection = table.getState().rowSelection;
  const { pageIndex, pageSize } = table.getState().pagination;
  const colCount = columns.length - (hasSelect ? 1 : 0) - (hasActions ? 1 : 0);
  const colWidth = 100 / colCount;
  const handleHorizontalScroll = (e) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    if (scrollLeft > 0) {
      setShowStickyBorder(true);
    } else {
      setShowStickyBorder(false);
    }
  };
  const handleAction = async (action) => {
    await action(rowSelection).then(() => {
      table.resetRowSelection();
    });
  };
  useEffect(() => {
    scrollableRef.current?.scroll({ top: 0, left: 0 });
  }, [pageIndex]);
  return /* @__PURE__ */ jsxs2(
    "div",
    {
      className: clx("flex w-full flex-col overflow-hidden", {
        "flex flex-1 flex-col": layout === "fill"
      }),
      children: [
        /* @__PURE__ */ jsx2(
          "div",
          {
            ref: scrollableRef,
            onScroll: handleHorizontalScroll,
            className: clx("w-full", {
              "min-h-0 flex-grow overflow-auto": layout === "fill",
              "overflow-x-auto": layout === "fit"
            }),
            children: !noResults ? /* @__PURE__ */ jsxs2(Table, { className: "relative w-full", children: [
              !noHeader && /* @__PURE__ */ jsx2(Table.Header, { className: "border-t-0", children: table.getHeaderGroups().map((headerGroup) => {
                return /* @__PURE__ */ jsx2(
                  Table.Row,
                  {
                    className: clx({
                      "relative border-b-0 [&_th:last-of-type]:w-[1%] [&_th:last-of-type]:whitespace-nowrap": hasActions,
                      "[&_th:first-of-type]:w-[1%] [&_th:first-of-type]:whitespace-nowrap": hasSelect
                    }),
                    children: headerGroup.headers.map((header, index) => {
                      const isActionHeader = header.id === "actions";
                      const isSelectHeader = header.id === "select";
                      const isSpecialHeader = isActionHeader || isSelectHeader;
                      const firstHeader = headerGroup.headers.findIndex(
                        (h) => h.id !== "select"
                      );
                      const isFirstHeader = firstHeader !== -1 ? header.id === headerGroup.headers[firstHeader].id : index === 0;
                      const isStickyHeader = isSelectHeader || isFirstHeader;
                      return /* @__PURE__ */ jsx2(
                        Table.HeaderCell,
                        {
                          "data-table-header-id": header.id,
                          style: {
                            width: !isSpecialHeader ? `${colWidth}%` : void 0
                          },
                          className: clx({
                            "bg-ui-bg-subtle sticky left-0 after:absolute after:inset-y-0 after:right-0 after:h-full after:w-px after:bg-transparent after:content-['']": isStickyHeader,
                            "left-[68px]": isStickyHeader && hasSelect && !isSelectHeader,
                            "after:bg-ui-border-base": showStickyBorder && isStickyHeader && !isSpecialHeader
                          }),
                          children: flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        },
                        header.id
                      );
                    })
                  },
                  headerGroup.id
                );
              }) }),
              /* @__PURE__ */ jsx2(Table.Body, { className: "border-b-0", children: table.getRowModel().rows.map((row) => {
                const to = navigateTo ? navigateTo(row) : void 0;
                const isRowDisabled = hasSelect && !row.getCanSelect();
                const isOdd = row.depth % 2 !== 0;
                const cells = row.getVisibleCells();
                return /* @__PURE__ */ jsx2(
                  Table.Row,
                  {
                    "data-selected": row.getIsSelected(),
                    className: clx(
                      "transition-fg group/row group relative [&_td:last-of-type]:w-[1%] [&_td:last-of-type]:whitespace-nowrap",
                      "has-[[data-row-link]:focus-visible]:bg-ui-bg-base-hover",
                      {
                        "bg-ui-bg-subtle hover:bg-ui-bg-subtle-hover": isOdd,
                        "cursor-pointer": !!to,
                        "bg-ui-bg-highlight hover:bg-ui-bg-highlight-hover": row.getIsSelected(),
                        "!bg-ui-bg-disabled !hover:bg-ui-bg-disabled": isRowDisabled
                      }
                    ),
                    children: cells.map((cell, index) => {
                      const visibleCells = row.getVisibleCells();
                      const isSelectCell = cell.column.id === "select";
                      const firstCell = visibleCells.findIndex(
                        (h) => h.column.id !== "select"
                      );
                      const isFirstCell = firstCell !== -1 ? cell.column.id === visibleCells[firstCell].column.id : index === 0;
                      const isStickyCell = isSelectCell || isFirstCell;
                      const depthOffset = row.depth > 0 && isFirstCell ? row.depth * 14 + 24 : void 0;
                      const hasLeftOffset = isStickyCell && hasSelect && !isSelectCell;
                      const Inner = flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      );
                      const isTabableLink = isFirstCell && !!to;
                      const shouldRenderAsLink = !!to && !isSelectCell;
                      return /* @__PURE__ */ jsx2(
                        Table.Cell,
                        {
                          className: clx({
                            "!pl-0 !pr-0": shouldRenderAsLink,
                            "bg-ui-bg-base group-data-[selected=true]/row:bg-ui-bg-highlight group-data-[selected=true]/row:group-hover/row:bg-ui-bg-highlight-hover group-hover/row:bg-ui-bg-base-hover transition-fg group-has-[[data-row-link]:focus-visible]:bg-ui-bg-base-hover sticky left-0 after:absolute after:inset-y-0 after:right-0 after:h-full after:w-px after:bg-transparent after:content-['']": isStickyCell,
                            "bg-ui-bg-subtle group-hover/row:bg-ui-bg-subtle-hover": isOdd && isStickyCell,
                            "left-[68px]": hasLeftOffset,
                            "after:bg-ui-border-base": showStickyBorder && isStickyCell && !isSelectCell,
                            "!bg-ui-bg-disabled !hover:bg-ui-bg-disabled": isRowDisabled
                          }),
                          style: {
                            paddingLeft: depthOffset ? `${depthOffset}px` : void 0
                          },
                          children: shouldRenderAsLink ? /* @__PURE__ */ jsx2(
                            Link,
                            {
                              to,
                              className: "size-full outline-none",
                              "data-row-link": true,
                              tabIndex: isTabableLink ? 0 : -1,
                              children: /* @__PURE__ */ jsx2(
                                "div",
                                {
                                  className: clx(
                                    "flex size-full items-center pr-6",
                                    {
                                      "pl-6": isTabableLink && !hasLeftOffset
                                    }
                                  ),
                                  children: Inner
                                }
                              )
                            }
                          ) : Inner
                        },
                        cell.id
                      );
                    })
                  },
                  row.id
                );
              }) })
            ] }) : /* @__PURE__ */ jsx2("div", { className: clx({ "border-b": layout === "fit" }), children: /* @__PURE__ */ jsx2(NoResults, {}) })
          }
        ),
        pagination && /* @__PURE__ */ jsx2("div", { className: clx({ "border-t": layout === "fill" }), children: /* @__PURE__ */ jsx2(
          Pagination,
          {
            canNextPage: table.getCanNextPage(),
            canPreviousPage: table.getCanPreviousPage(),
            nextPage: table.nextPage,
            previousPage: table.previousPage,
            count,
            pageIndex,
            pageCount: table.getPageCount(),
            pageSize
          }
        ) }),
        hasCommandBar && /* @__PURE__ */ jsx2(CommandBar, { open: !!Object.keys(rowSelection).length, children: /* @__PURE__ */ jsxs2(CommandBar.Bar, { children: [
          /* @__PURE__ */ jsx2(CommandBar.Value, { children: t("general.countSelected", {
            count: Object.keys(rowSelection).length
          }) }),
          /* @__PURE__ */ jsx2(CommandBar.Seperator, {}),
          commands?.map((command, index) => {
            return /* @__PURE__ */ jsxs2(Fragment, { children: [
              /* @__PURE__ */ jsx2(
                CommandBar.Command,
                {
                  label: command.label,
                  shortcut: command.shortcut,
                  action: () => handleAction(command.action)
                }
              ),
              index < commands.length - 1 && /* @__PURE__ */ jsx2(CommandBar.Seperator, {})
            ] }, index);
          })
        ] }) })
      ]
    }
  );
};
var Pagination = (props) => {
  const { t } = useTranslation();
  const translations = {
    of: t("general.of"),
    results: t("general.results"),
    pages: t("general.pages"),
    prev: t("general.prev"),
    next: t("general.next")
  };
  return /* @__PURE__ */ jsx2(
    Table.Pagination,
    {
      className: "flex-shrink-0",
      ...props,
      translations
    }
  );
};

// src/components/table/data-table/data-table.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var MemoizedDataTableQuery = memo(DataTableQuery);
var _DataTable = ({
  table,
  columns,
  pagination,
  navigateTo,
  commands,
  count = 0,
  search = false,
  orderBy,
  filters,
  prefix,
  queryObject = {},
  pageSize,
  isLoading = false,
  noHeader = false,
  layout = "fit",
  noRecords: noRecordsProps = {}
}) => {
  if (isLoading) {
    return /* @__PURE__ */ jsx3(
      TableSkeleton,
      {
        layout,
        rowCount: pageSize,
        search: !!search,
        filters: !!filters?.length,
        orderBy: !!orderBy?.length,
        pagination: !!pagination
      }
    );
  }
  const noQuery = Object.values(queryObject).filter((v) => Boolean(v)).length === 0;
  const noResults = !isLoading && count === 0 && !noQuery;
  const noRecords = !isLoading && count === 0 && noQuery;
  if (noRecords) {
    return /* @__PURE__ */ jsx3(
      NoRecords,
      {
        className: clx2({
          "flex h-full flex-col overflow-hidden": layout === "fill"
        }),
        ...noRecordsProps
      }
    );
  }
  return /* @__PURE__ */ jsxs3(
    "div",
    {
      className: clx2("divide-y", {
        "flex h-full flex-col overflow-hidden": layout === "fill"
      }),
      children: [
        /* @__PURE__ */ jsx3(
          MemoizedDataTableQuery,
          {
            search,
            orderBy,
            filters,
            prefix
          }
        ),
        /* @__PURE__ */ jsx3(
          DataTableRoot,
          {
            table,
            count,
            columns,
            pagination: true,
            navigateTo,
            commands,
            noResults,
            noHeader,
            layout
          }
        )
      ]
    }
  );
};

// src/hooks/use-data-table.tsx
import {
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  useReactTable
} from "@tanstack/react-table";
import { useEffect as useEffect2, useMemo, useState as useState2 } from "react";
import { useSearchParams } from "react-router-dom";
var useDataTable = ({
  data = [],
  columns,
  count = 0,
  pageSize: _pageSize = 20,
  enablePagination = true,
  enableRowSelection = false,
  enableExpandableRows = false,
  rowSelection: _rowSelection,
  getSubRows,
  getRowId,
  meta,
  prefix
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const offsetKey = `${prefix ? `${prefix}_` : ""}offset`;
  const offset = searchParams.get(offsetKey);
  const [{ pageIndex, pageSize }, setPagination] = useState2({
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
  const [localRowSelection, setLocalRowSelection] = useState2({});
  const rowSelection = _rowSelection?.state ?? localRowSelection;
  const setRowSelection = _rowSelection?.updater ?? setLocalRowSelection;
  useEffect2(() => {
    if (!enablePagination) {
      return;
    }
    const index = offset ? Math.ceil(Number(offset) / _pageSize) : 0;
    if (index === pageIndex) {
      return;
    }
    setPagination((prev) => ({
      ...prev,
      pageIndex: index
    }));
  }, [offset, enablePagination, _pageSize, pageIndex]);
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
    columns,
    state: {
      rowSelection,
      // We always pass a selection state to the table even if it's not enabled
      pagination: enablePagination ? pagination : void 0
    },
    pageCount: Math.ceil((count ?? 0) / pageSize),
    enableRowSelection,
    getRowId,
    getSubRows,
    onRowSelectionChange: enableRowSelection ? setRowSelection : void 0,
    onPaginationChange: enablePagination ? onPaginationChange : void 0,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : void 0,
    getExpandedRowModel: enableExpandableRows ? getExpandedRowModel() : void 0,
    manualPagination: enablePagination ? true : void 0,
    meta
  });
  return { table };
};

export {
  _DataTable,
  useDataTable
};
