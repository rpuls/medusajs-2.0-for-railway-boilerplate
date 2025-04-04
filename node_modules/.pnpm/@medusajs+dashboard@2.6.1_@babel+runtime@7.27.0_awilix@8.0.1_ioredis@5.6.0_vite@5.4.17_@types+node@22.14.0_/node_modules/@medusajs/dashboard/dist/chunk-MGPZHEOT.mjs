import {
  ActionMenu
} from "./chunk-3NJTXRIY.mjs";
import {
  useQueryParams
} from "./chunk-C76H5USB.mjs";
import {
  useDate
} from "./chunk-DV5RB7II.mjs";

// src/components/data-table/data-table.tsx
import {
  Button,
  clx,
  Heading,
  DataTable as Primitive,
  Text,
  useDataTable
} from "@medusajs/ui";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { jsx, jsxs } from "react/jsx-runtime";
var DataTable = ({
  data = [],
  columns,
  filters,
  commands,
  action,
  actionMenu,
  getRowId,
  rowCount = 0,
  enablePagination = true,
  enableSearch = true,
  autoFocusSearch = false,
  rowHref,
  heading,
  subHeading,
  prefix,
  pageSize = 10,
  emptyState,
  rowSelection,
  isLoading = false,
  layout = "auto"
}) => {
  const { t } = useTranslation();
  const enableFiltering = filters && filters.length > 0;
  const enableCommands = commands && commands.length > 0;
  const enableSorting = columns.some((column) => column.enableSorting);
  const filterIds = useMemo(() => filters?.map((f) => f.id) ?? [], [filters]);
  const prefixedFilterIds = filterIds.map((id) => getQueryParamKey(id, prefix));
  const { offset, order, q, ...filterParams } = useQueryParams(
    [
      ...filterIds,
      ...enableSorting ? ["order"] : [],
      ...enableSearch ? ["q"] : [],
      ...enablePagination ? ["offset"] : []
    ],
    prefix
  );
  const [_, setSearchParams] = useSearchParams();
  const search = useMemo(() => {
    return q ?? "";
  }, [q]);
  const handleSearchChange = (value) => {
    setSearchParams((prev) => {
      if (value) {
        prev.set(getQueryParamKey("q", prefix), value);
      } else {
        prev.delete(getQueryParamKey("q", prefix));
      }
      return prev;
    });
  };
  const pagination = useMemo(() => {
    return offset ? parsePaginationState(offset, pageSize) : { pageIndex: 0, pageSize };
  }, [offset, pageSize]);
  const handlePaginationChange = (value) => {
    setSearchParams((prev) => {
      if (value.pageIndex === 0) {
        prev.delete(getQueryParamKey("offset", prefix));
      } else {
        prev.set(
          getQueryParamKey("offset", prefix),
          transformPaginationState(value).toString()
        );
      }
      return prev;
    });
  };
  const filtering = useMemo(
    () => parseFilterState(filterIds, filterParams),
    [filterIds, filterParams]
  );
  const handleFilteringChange = (value) => {
    setSearchParams((prev) => {
      Array.from(prev.keys()).forEach((key) => {
        if (prefixedFilterIds.includes(key) && !(key in value)) {
          prev.delete(key);
        }
      });
      Object.entries(value).forEach(([key, filter]) => {
        if (prefixedFilterIds.includes(getQueryParamKey(key, prefix)) && filter) {
          prev.set(getQueryParamKey(key, prefix), JSON.stringify(filter));
        }
      });
      return prev;
    });
  };
  const sorting = useMemo(() => {
    return order ? parseSortingState(order) : null;
  }, [order]);
  const handleSortingChange = (value) => {
    setSearchParams((prev) => {
      if (value) {
        const valueToStore = transformSortingState(value);
        prev.set(getQueryParamKey("order", prefix), valueToStore);
      } else {
        prev.delete(getQueryParamKey("order", prefix));
      }
      return prev;
    });
  };
  const { pagination: paginationTranslations, toolbar: toolbarTranslations } = useDataTableTranslations();
  const navigate = useNavigate();
  const onRowClick = useCallback(
    (event, row) => {
      if (!rowHref) {
        return;
      }
      const href = rowHref(row);
      if (event.metaKey || event.ctrlKey || event.button === 1) {
        window.open(href, "_blank", "noreferrer");
        return;
      }
      if (event.shiftKey) {
        window.open(href, void 0, "noreferrer");
        return;
      }
      navigate(href);
    },
    [navigate, rowHref]
  );
  const instance = useDataTable({
    data,
    columns,
    filters,
    commands,
    rowCount,
    getRowId,
    onRowClick: rowHref ? onRowClick : void 0,
    pagination: enablePagination ? {
      state: pagination,
      onPaginationChange: handlePaginationChange
    } : void 0,
    filtering: enableFiltering ? {
      state: filtering,
      onFilteringChange: handleFilteringChange
    } : void 0,
    sorting: enableSorting ? {
      state: sorting,
      onSortingChange: handleSortingChange
    } : void 0,
    search: enableSearch ? {
      state: search,
      onSearchChange: handleSearchChange
    } : void 0,
    rowSelection,
    isLoading
  });
  const shouldRenderHeading = heading || subHeading;
  return /* @__PURE__ */ jsxs(
    Primitive,
    {
      instance,
      className: clx({
        "h-full [&_tr]:last-of-type:!border-b": layout === "fill"
      }),
      children: [
        /* @__PURE__ */ jsxs(
          Primitive.Toolbar,
          {
            className: "flex flex-col items-start justify-between gap-2 md:flex-row md:items-center",
            translations: toolbarTranslations,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex w-full items-center justify-between gap-2", children: [
                shouldRenderHeading && /* @__PURE__ */ jsxs("div", { children: [
                  heading && /* @__PURE__ */ jsx(Heading, { children: heading }),
                  subHeading && /* @__PURE__ */ jsx(Text, { size: "small", className: "text-ui-fg-subtle", children: subHeading })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-x-2 md:hidden", children: [
                  enableFiltering && /* @__PURE__ */ jsx(Primitive.FilterMenu, { tooltip: t("filters.filterLabel") }),
                  /* @__PURE__ */ jsx(Primitive.SortingMenu, { tooltip: t("filters.sortLabel") }),
                  actionMenu && /* @__PURE__ */ jsx(ActionMenu, { variant: "primary", ...actionMenu }),
                  action && /* @__PURE__ */ jsx(DataTableAction, { ...action })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex w-full items-center gap-2 md:justify-end", children: [
                enableSearch && /* @__PURE__ */ jsx("div", { className: "w-full md:w-auto", children: /* @__PURE__ */ jsx(
                  Primitive.Search,
                  {
                    placeholder: t("filters.searchLabel"),
                    autoFocus: autoFocusSearch
                  }
                ) }),
                /* @__PURE__ */ jsxs("div", { className: "hidden items-center gap-x-2 md:flex", children: [
                  enableFiltering && /* @__PURE__ */ jsx(Primitive.FilterMenu, { tooltip: t("filters.filterLabel") }),
                  /* @__PURE__ */ jsx(Primitive.SortingMenu, { tooltip: t("filters.sortLabel") }),
                  actionMenu && /* @__PURE__ */ jsx(ActionMenu, { variant: "primary", ...actionMenu }),
                  action && /* @__PURE__ */ jsx(DataTableAction, { ...action })
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx(Primitive.Table, { emptyState }),
        enablePagination && /* @__PURE__ */ jsx(Primitive.Pagination, { translations: paginationTranslations }),
        enableCommands && /* @__PURE__ */ jsx(Primitive.CommandBar, { selectedLabel: (count) => `${count} selected` })
      ]
    }
  );
};
function transformSortingState(value) {
  return value.desc ? `-${value.id}` : value.id;
}
function parseSortingState(value) {
  return value.startsWith("-") ? { id: value.slice(1), desc: true } : { id: value, desc: false };
}
function transformPaginationState(value) {
  return value.pageIndex * value.pageSize;
}
function parsePaginationState(value, pageSize) {
  const offset = parseInt(value);
  return {
    pageIndex: Math.floor(offset / pageSize),
    pageSize
  };
}
function parseFilterState(filterIds, value) {
  if (!value) {
    return {};
  }
  const filters = {};
  for (const id of filterIds) {
    const filterValue = value[id];
    if (filterValue) {
      filters[id] = JSON.parse(filterValue);
    }
  }
  return filters;
}
function getQueryParamKey(key, prefix) {
  return prefix ? `${prefix}_${key}` : key;
}
var useDataTableTranslations = () => {
  const { t } = useTranslation();
  const paginationTranslations = {
    of: t("general.of"),
    results: t("general.results"),
    pages: t("general.pages"),
    prev: t("general.prev"),
    next: t("general.next")
  };
  const toolbarTranslations = {
    clearAll: t("actions.clearAll")
  };
  return {
    pagination: paginationTranslations,
    toolbar: toolbarTranslations
  };
};
var DataTableAction = ({
  label,
  disabled,
  ...props
}) => {
  const buttonProps = {
    size: "small",
    disabled: disabled ?? false,
    type: "button",
    variant: "secondary"
  };
  if ("to" in props) {
    return /* @__PURE__ */ jsx(Button, { ...buttonProps, asChild: true, children: /* @__PURE__ */ jsx(Link, { to: props.to, children: label }) });
  }
  return /* @__PURE__ */ jsx(Button, { ...buttonProps, onClick: props.onClick, children: label });
};

// src/components/data-table/helpers/general/use-data-table-date-filters.tsx
import { createDataTableFilterHelper } from "@medusajs/ui";
import { subDays, subMonths } from "date-fns";
import { useMemo as useMemo2 } from "react";
import { useTranslation as useTranslation2 } from "react-i18next";
var filterHelper = createDataTableFilterHelper();
var useDateFilterOptions = () => {
  const { t } = useTranslation2();
  const today = useMemo2(() => {
    const date = /* @__PURE__ */ new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  return useMemo2(() => {
    return [
      {
        label: t("filters.date.today"),
        value: {
          $gte: today.toISOString()
        }
      },
      {
        label: t("filters.date.lastSevenDays"),
        value: {
          $gte: subDays(today, 7).toISOString()
          // 7 days ago
        }
      },
      {
        label: t("filters.date.lastThirtyDays"),
        value: {
          $gte: subDays(today, 30).toISOString()
          // 30 days ago
        }
      },
      {
        label: t("filters.date.lastNinetyDays"),
        value: {
          $gte: subDays(today, 90).toISOString()
          // 90 days ago
        }
      },
      {
        label: t("filters.date.lastTwelveMonths"),
        value: {
          $gte: subMonths(today, 12).toISOString()
          // 12 months ago
        }
      }
    ];
  }, [today, t]);
};
var useDataTableDateFilters = (disableRangeOption) => {
  const { t } = useTranslation2();
  const { getFullDate } = useDate();
  const dateFilterOptions = useDateFilterOptions();
  const rangeOptions = useMemo2(() => {
    if (disableRangeOption) {
      return {
        disableRangeOption: true
      };
    }
    return {
      rangeOptionStartLabel: t("filters.date.starting"),
      rangeOptionEndLabel: t("filters.date.ending"),
      rangeOptionLabel: t("filters.date.custom"),
      options: dateFilterOptions
    };
  }, [disableRangeOption, t, dateFilterOptions]);
  return useMemo2(() => {
    return [
      filterHelper.accessor("created_at", {
        type: "date",
        label: t("fields.createdAt"),
        format: "date",
        formatDateValue: (date) => getFullDate({ date }),
        options: dateFilterOptions,
        ...rangeOptions
      }),
      filterHelper.accessor("updated_at", {
        type: "date",
        label: t("fields.updatedAt"),
        format: "date",
        formatDateValue: (date) => getFullDate({ date }),
        options: dateFilterOptions,
        ...rangeOptions
      })
    ];
  }, [t, dateFilterOptions, getFullDate, rangeOptions]);
};

export {
  DataTable,
  useDataTableDateFilters
};
