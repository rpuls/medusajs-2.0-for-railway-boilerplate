import { useState, useMemo, useCallback, useEffect } from "react"
import { Container, Button } from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"

import { DataTable } from "../../../../../components/data-table"
import { useOrders } from "../../../../../hooks/api/orders"
import { useConfigurableOrderTableColumns } from "../../../../../hooks/table/columns/use-configurable-order-table-columns"
import { useOrderTableFilters } from "./use-order-table-filters"
import { useOrderTableQuery } from "../../../../../hooks/table/query/use-order-table-query"
import { useViewConfigurations, useViewConfiguration } from "../../../../../hooks/use-view-configurations"
import { useEntityColumns } from "../../../../../hooks/api/views"
import { useFeatureFlag } from "../../../../../providers/feature-flag-provider"
import { useColumnState } from "../../../../../hooks/table/columns/use-column-state"
import { useQueryParams } from "../../../../../hooks/use-query-params"
import { SaveViewDropdown } from "./components/save-view-dropdown"
import { SaveViewDialog } from "../../../../../components/table/save-view-dialog"
import { useRequiredFields } from "./hooks/use-required-fields"

const PAGE_SIZE = 20
const QUERY_PREFIX = "o"

function parseSortingState(value: string) {
  return value.startsWith("-")
    ? { id: value.slice(1), desc: true }
    : { id: value, desc: false }
}

export const ConfigurableOrderListTable = () => {
  const { t } = useTranslation()
  const isViewConfigEnabled = useFeatureFlag("view_configurations")

  const {
    activeView,
    createView,
  } = useViewConfigurations("orders")

  const currentActiveView = activeView?.view_configuration || null

  const { updateView } = useViewConfiguration("orders", currentActiveView?.id || "")

  const { columns: apiColumns, isLoading: isLoadingColumns } = useEntityColumns("orders", {
    enabled: isViewConfigEnabled,
  })

  const filters = useOrderTableFilters()

  const queryParams = useQueryParams(
    ["q", "order", ...filters.map(f => f.id)],
    QUERY_PREFIX
  )

  const [_, setSearchParams] = useSearchParams()

  const {
    visibleColumns,
    columnOrder,
    currentColumns,
    setColumnOrder,
    handleColumnVisibilityChange,
    handleViewChange: originalHandleViewChange,
  } = useColumnState(apiColumns, currentActiveView)

  useEffect(() => {
    if (!apiColumns) return
    originalHandleViewChange(currentActiveView, apiColumns)
    setSearchParams((prev) => {
      const keysToDelete = Array.from(prev.keys()).filter(key =>
        key.startsWith(QUERY_PREFIX + "_") || key === QUERY_PREFIX + "_q" || key === QUERY_PREFIX + "_order"
      )
      keysToDelete.forEach(key => prev.delete(key))

      if (currentActiveView) {
        const viewConfig = currentActiveView.configuration

        if (viewConfig.filters) {
          Object.entries(viewConfig.filters).forEach(([key, value]) => {
            prev.set(`${QUERY_PREFIX}_${key}`, JSON.stringify(value))
          })
        }

        if (viewConfig.sorting) {
          const sortValue = viewConfig.sorting.desc
            ? `-${viewConfig.sorting.id}`
            : viewConfig.sorting.id
          prev.set(`${QUERY_PREFIX}_order`, sortValue)
        }

        if (viewConfig.search) {
          prev.set(`${QUERY_PREFIX}_q`, viewConfig.search)
        }
      }

      return prev
    })
  }, [currentActiveView, apiColumns])

  const [debouncedHasConfigChanged, setDebouncedHasConfigChanged] = useState(false)

  const hasConfigurationChanged = useMemo(() => {
    const currentFilters: Record<string, any> = {}
    filters.forEach(filter => {
      if (queryParams[filter.id] !== undefined) {
        currentFilters[filter.id] = JSON.parse(queryParams[filter.id] || "")
      }
    })

    const currentSorting = queryParams.order ? parseSortingState(queryParams.order) : null
    const currentSearch = queryParams.q || ""
    const currentVisibleColumns = Object.entries(visibleColumns)
      .filter(([_, isVisible]) => isVisible)
      .map(([field]) => field)
      .sort()

    if (currentActiveView) {
      const viewFilters = currentActiveView.configuration.filters || {}
      const viewSorting = currentActiveView.configuration.sorting
      const viewSearch = currentActiveView.configuration.search || ""
      const viewVisibleColumns = [...(currentActiveView.configuration.visible_columns || [])].sort()
      const viewColumnOrder = currentActiveView.configuration.column_order || []

      const filterKeys = new Set([...Object.keys(currentFilters), ...Object.keys(viewFilters)])
      for (const key of filterKeys) {
        if (JSON.stringify(currentFilters[key]) !== JSON.stringify(viewFilters[key])) {
          return true
        }
      }

      const normalizedCurrentSorting = currentSorting || undefined
      const normalizedViewSorting = viewSorting || undefined
      if (JSON.stringify(normalizedCurrentSorting) !== JSON.stringify(normalizedViewSorting)) {
        return true
      }

      if (currentSearch !== viewSearch) {
        return true
      }

      if (JSON.stringify(currentVisibleColumns) !== JSON.stringify(viewVisibleColumns)) {
        return true
      }

      if (JSON.stringify(columnOrder) !== JSON.stringify(viewColumnOrder)) {
        return true
      }
    } else {
      if (Object.keys(currentFilters).length > 0) return true
      if (currentSorting !== null) return true
      if (currentSearch !== "") return true

      if (apiColumns) {
        const currentVisibleSet = new Set(
          Object.entries(visibleColumns)
            .filter(([_, isVisible]) => isVisible)
            .map(([field]) => field)
        )

        const defaultVisibleSet = new Set(
          apiColumns
            .filter(col => col.default_visible)
            .map(col => col.field)
        )

        if (currentVisibleSet.size !== defaultVisibleSet.size ||
          [...currentVisibleSet].some(field => !defaultVisibleSet.has(field))) {
          return true
        }

        const defaultOrder = apiColumns
          .sort((a, b) => (a.default_order ?? 500) - (b.default_order ?? 500))
          .map(col => col.field)

        if (JSON.stringify(columnOrder) !== JSON.stringify(defaultOrder)) {
          return true
        }
      }
    }

    return false
  }, [currentActiveView, visibleColumns, columnOrder, filters, queryParams, apiColumns])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHasConfigChanged(hasConfigurationChanged)
    }, 50)

    return () => clearTimeout(timer)
  }, [hasConfigurationChanged])

  const handleClearConfiguration = useCallback(() => {
    if (apiColumns) {
      originalHandleViewChange(currentActiveView, apiColumns)
    }

    setSearchParams((prev) => {
      const keysToDelete = Array.from(prev.keys()).filter(key =>
        key.startsWith(QUERY_PREFIX + "_") || key === QUERY_PREFIX + "_q" || key === QUERY_PREFIX + "_order"
      )
      keysToDelete.forEach(key => prev.delete(key))

      if (currentActiveView?.configuration) {
        const viewConfig = currentActiveView.configuration

        if (viewConfig.filters) {
          Object.entries(viewConfig.filters).forEach(([key, value]) => {
            prev.set(`${QUERY_PREFIX}_${key}`, JSON.stringify(value))
          })
        }

        if (viewConfig.sorting) {
          const sortValue = viewConfig.sorting.desc
            ? `-${viewConfig.sorting.id}`
            : viewConfig.sorting.id
          prev.set(`${QUERY_PREFIX}_order`, sortValue)
        }

        if (viewConfig.search) {
          prev.set(`${QUERY_PREFIX}_q`, viewConfig.search)
        }
      }

      return prev
    })
  }, [currentActiveView, apiColumns])

  const currentConfiguration = useMemo(() => {
    const currentFilters: Record<string, any> = {}
    filters.forEach(filter => {
      if (queryParams[filter.id] !== undefined) {
        currentFilters[filter.id] = JSON.parse(queryParams[filter.id] || "")
      }
    })

    return {
      filters: currentFilters,
      sorting: queryParams.order ? parseSortingState(queryParams.order) : null,
      search: queryParams.q || "",
    }
  }, [filters, queryParams])

  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [editingView, setEditingView] = useState<any>(null)

  const handleSaveAsDefault = async () => {
    try {
      if (currentActiveView?.is_system_default) {
        await updateView.mutateAsync({
          name: currentActiveView.name || null,
          configuration: {
            visible_columns: currentColumns.visible,
            column_order: currentColumns.order,
            filters: currentConfiguration.filters || {},
            sorting: currentConfiguration.sorting || null,
            search: currentConfiguration.search || "",
          }
        })
      } else {
        await createView.mutateAsync({
          name: "Default",
          is_system_default: true,
          set_active: true,
          configuration: {
            visible_columns: currentColumns.visible,
            column_order: currentColumns.order,
            filters: currentConfiguration.filters || {},
            sorting: currentConfiguration.sorting || null,
            search: currentConfiguration.search || "",
          }
        })
      }
    } catch (_) {
      // Error is handled by the hook
    }
  }

  const handleUpdateExisting = async () => {
    if (!currentActiveView) return

    try {
      await updateView.mutateAsync({
        name: currentActiveView.name,
        configuration: {
          visible_columns: currentColumns.visible,
          column_order: currentColumns.order,
          filters: currentConfiguration.filters || {},
          sorting: currentConfiguration.sorting || null,
          search: currentConfiguration.search || "",
        }
      })
    } catch (_) {
      // Error is handled by the hook
    }
  }

  const handleSaveAsNew = () => {
    setSaveDialogOpen(true)
    setEditingView(null)
  }

  const requiredFields = useRequiredFields(apiColumns, visibleColumns)

  const filterBarContent = debouncedHasConfigChanged ? (
    <>
      <Button
        variant="secondary"
        size="small"
        type="button"
        onClick={handleClearConfiguration}
      >
        {t("actions.clear")}
      </Button>
      <SaveViewDropdown
        isDefaultView={currentActiveView?.is_system_default || !currentActiveView}
        currentViewId={currentActiveView?.id}
        currentViewName={currentActiveView?.name}
        onSaveAsDefault={handleSaveAsDefault}
        onUpdateExisting={handleUpdateExisting}
        onSaveAsNew={handleSaveAsNew}
      />
    </>
  ) : null

  const { searchParams } = useOrderTableQuery({
    pageSize: PAGE_SIZE,
    prefix: QUERY_PREFIX,
  })

  const { orders, count, isError, error, isLoading } = useOrders(
    {
      fields: requiredFields,
      ...searchParams,
    },
    {
      placeholderData: keepPreviousData,
    }
  )

  const columns = useConfigurableOrderTableColumns(apiColumns)

  if (isError) {
    throw error
  }

  return (
    <Container className="divide-y p-0">
      <DataTable
        data={orders ?? []}
        columns={columns}
        filters={filters}
        getRowId={(row) => row.id}
        rowCount={count}
        enablePagination
        enableSearch
        pageSize={PAGE_SIZE}
        isLoading={isLoading || isLoadingColumns}
        layout="fill"
        heading={t("orders.domain")}
        enableColumnVisibility={isViewConfigEnabled}
        initialColumnVisibility={visibleColumns}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        enableViewSelector={isViewConfigEnabled}
        entity="orders"
        currentColumns={currentColumns}
        filterBarContent={filterBarContent}
        rowHref={(row) => `/orders/${row.id}`}
        emptyState={{
          empty: {
            heading: t("orders.list.noRecordsMessage"),
          }
        }}
        prefix={QUERY_PREFIX}
      />

      {saveDialogOpen && (
        <SaveViewDialog
          entity="orders"
          currentColumns={currentColumns}
          currentConfiguration={currentConfiguration}
          editingView={editingView}
          onClose={() => {
            setSaveDialogOpen(false)
            setEditingView(null)
          }}
          onSaved={() => {
            setSaveDialogOpen(false)
            setEditingView(null)
          }}
        />
      )}
    </Container>
  )
}
