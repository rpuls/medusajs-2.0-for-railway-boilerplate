import { GlobeEurope, PencilSquare, Trash } from "@medusajs/icons"
import { Button, Checkbox, Container, Heading, toast, usePrompt } from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { createColumnHelper } from "@tanstack/react-table"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, Outlet, useLoaderData, useLocation } from "react-router-dom"

import { HttpTypes } from "@medusajs/types"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { _DataTable } from "../../../../../components/table/data-table"
import {
  useDeleteProduct,
  useProducts,
} from "../../../../../hooks/api/products"
import { useProductTableColumns } from "../../../../../hooks/table/columns/use-product-table-columns"
import { useProductTableFilters } from "../../../../../hooks/table/filters/use-product-table-filters"
import { useProductTableQuery } from "../../../../../hooks/table/query/use-product-table-query"
import { useDataTable } from "../../../../../hooks/use-data-table"
import { productsLoader } from "../../loader"
import { useFeatureFlag } from "../../../../../providers/feature-flag-provider"
import { ConfigurableProductListTable } from "./configurable-product-list-table"
import { BulkEditModal } from "../bulk-edit-modal/bulk-edit-modal"

const PAGE_SIZE = 20

export const ProductListTable = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const isViewConfigEnabled = useFeatureFlag("view_configurations")

  const [bulkEditOpen, setBulkEditOpen] = useState(false)
  const [selectAllMode, setSelectAllMode] = useState(false)
  const [capturedSelectedCount, setCapturedSelectedCount] = useState<number>(0)
  const [capturedSelectedIds, setCapturedSelectedIds] = useState<string[]>([])
  const selectAllModeRef = useRef(false)

  // If feature flag is enabled, use the new configurable table
  if (isViewConfigEnabled) {
    return <ConfigurableProductListTable />
  }

  const initialData = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof productsLoader>>
  >

  const { searchParams, raw } = useProductTableQuery({ pageSize: PAGE_SIZE })
  const { products, count, isLoading, isError, error } = useProducts(
    {
      ...searchParams,
      is_giftcard: false,
    },
    {
      initialData,
      placeholderData: keepPreviousData,
    }
  )

  const filters = useProductTableFilters()
  const baseColumns = useProductTableColumns()
  const columns = useMemo(() => {
    return createColumns(baseColumns, selectAllMode, setSelectAllMode)
  }, [baseColumns, selectAllMode, setSelectAllMode])

  const { table } = useDataTable({
    data: (products ?? []) as HttpTypes.AdminProduct[],
    columns,
    count,
    enablePagination: true,
    enableRowSelection: true,
    pageSize: PAGE_SIZE,
    getRowId: (row) => row.id,
  })

  const rowSelection = table.getState().rowSelection
  
  // Sync ref with state
  useEffect(() => {
    selectAllModeRef.current = selectAllMode
  }, [selectAllMode])

  // When selectAllMode is active, select all current page rows for visual feedback in CommandBar
  // This ensures the CommandBar stays visible when "Select All" is clicked
  // We monitor rowSelection changes because CommandBar resets selection after actions complete
  useEffect(() => {
    // Only act if we're in selectAllMode
    if (!selectAllModeRef.current || !products || products.length === 0) {
      return
    }

    const currentSelectionKeys = Object.keys(rowSelection)
    const allPageIds = products.reduce((acc, p) => {
      acc[p.id] = true
      return acc
    }, {} as Record<string, boolean>)
    const allPageIdsKeys = Object.keys(allPageIds)
    
    // If selection is empty or doesn't match all page rows, restore it
    // This handles the case where CommandBar resets selection after action completes
    const needsReselection = 
      currentSelectionKeys.length === 0 || 
      currentSelectionKeys.length !== allPageIdsKeys.length ||
      !allPageIdsKeys.every(id => currentSelectionKeys.includes(id))
    
    if (needsReselection) {
      table.setRowSelection(allPageIds)
    }
  }, [selectAllMode, products, table, rowSelection])
  
  const selectedProductIds = selectAllMode ? [] : Object.keys(rowSelection)
  
  // Calculate the actual count to display in modal
  // Use capturedSelectedCount if available (set when modal opens), otherwise calculate
  // Use count for selectAllMode, otherwise use the length of selectedProductIds
  // Ensure count is a valid number (default to 0 if undefined/null)
  const actualSelectedCount = capturedSelectedCount > 0 
    ? capturedSelectedCount
    : (selectAllMode 
      ? (count ?? 0) 
      : selectedProductIds.length)
  
  const handleBulkEdit = async (selection: Record<string, boolean>) => {
    // Capture the IDs and count BEFORE opening the modal to avoid timing issues
    // Use the selection passed from CommandBar (this is the current selection state)
    const currentSelection = Object.keys(selection).length > 0 ? selection : rowSelection
    const currentSelectedIds = selectAllMode ? [] : Object.keys(currentSelection)
    const currentCount = selectAllMode ? (count ?? 0) : currentSelectedIds.length
    
    // Check if we have any selections
    if (currentCount === 0) {
      toast.error(t("products.bulkEdit.error.header"), {
        description: "Please select at least one product to edit.",
      })
      return
    }
    
    // Store the IDs and count in state before opening modal
    // This ensures the modal has the correct data even if CommandBar resets selection
    setCapturedSelectedIds(currentSelectedIds)
    setCapturedSelectedCount(currentCount)
    setBulkEditOpen(true)
  }

  const handleSelectAll = async (_selection: Record<string, boolean>) => {
    setSelectAllMode(true)
    // Don't reset selection immediately - let the useEffect handle it
    // This ensures the CommandBar stays visible
    if (products && products.length > 0) {
      const allPageIds = products.reduce((acc, p) => {
        acc[p.id] = true
        return acc
      }, {} as Record<string, boolean>)
      table.setRowSelection(allPageIds)
    }
  }

  const handleDeselectAll = async (_selection: Record<string, boolean>) => {
    setSelectAllMode(false)
    table.resetRowSelection()
  }

  const handleBulkEditSuccess = () => {
    table.resetRowSelection()
    setSelectAllMode(false)
    setCapturedSelectedCount(0)
    setCapturedSelectedIds([])
  }

  if (isError) {
    throw error
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t("products.domain")}</Heading>
        <div className="flex items-center justify-center gap-x-2">
          <Button size="small" variant="secondary" asChild>
            <Link to={`export${location.search}`}>{t("actions.export")}</Link>
          </Button>
          <Button size="small" variant="secondary" asChild>
            <Link to="import">{t("actions.import")}</Link>
          </Button>
          <Button size="small" variant="secondary" asChild>
            <Link to="create">{t("actions.create")}</Link>
          </Button>
        </div>
      </div>
      <_DataTable
        table={table}
        columns={columns}
        count={count}
        pageSize={PAGE_SIZE}
        filters={filters}
        search
        pagination
        isLoading={isLoading}
        queryObject={raw}
        navigateTo={(row) => `${row.original.id}`}
        orderBy={[
          { key: "title", label: t("fields.title") },
          { key: "created_at", label: t("fields.createdAt") },
          { key: "updated_at", label: t("fields.updatedAt") },
        ]}
        noRecords={{
          message: t("products.list.noRecordsMessage"),
        }}
        commands={[
          ...(selectAllMode
            ? [
                {
                  label: t("products.bulkEdit.deselectAll"),
                  shortcut: "D",
                  action: handleDeselectAll,
                },
              ]
            : [
                {
                  label: t("products.bulkEdit.selectAll"),
                  shortcut: "A",
                  action: handleSelectAll,
                },
              ]),
          {
            label: t("products.bulkEdit.action"),
            shortcut: "E",
            action: handleBulkEdit,
          },
        ]}
      />
      <BulkEditModal
        open={bulkEditOpen}
        onOpenChange={setBulkEditOpen}
        selectedProductIds={capturedSelectedIds.length > 0 ? capturedSelectedIds : selectedProductIds}
        selectAllMode={selectAllMode}
        searchParams={searchParams}
        totalCount={count}
        selectedCount={actualSelectedCount}
        onSuccess={handleBulkEditSuccess}
      />
      <Outlet />
    </Container>
  )
}

const ProductActions = ({ product }: { product: HttpTypes.AdminProduct }) => {
  const { t } = useTranslation()
  const prompt = usePrompt()
  const { mutateAsync } = useDeleteProduct(product.id)
  const isTranslationsEnabled = useFeatureFlag("translation")

  const handleDelete = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("products.deleteWarning", {
        title: product.title,
      }),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel"),
    })

    if (!res) {
      return
    }

    await mutateAsync(undefined, {
      onSuccess: () => {
        toast.success(t("products.toasts.delete.success.header"), {
          description: t("products.toasts.delete.success.description", {
            title: product.title,
          }),
        })
      },
      onError: (e) => {
        toast.error(t("products.toasts.delete.error.header"), {
          description: e.message,
        })
      },
    })
  }

  return (
    <ActionMenu
      groups={[
        {
          actions: [
            {
              icon: <PencilSquare />,
              label: t("actions.edit"),
              to: `/products/${product.id}/edit`,
            },
          ],
        },
        ...(isTranslationsEnabled
          ? [
              {
                actions: [
                  {
                    icon: <GlobeEurope />,
                    label: t("translations.actions.manage"),
                    to: `/settings/translations/edit?reference=product&reference_id=${product.id}`,
                  },
                ],
              },
            ]
          : []),
        {
          actions: [
            {
              icon: <Trash />,
              label: t("actions.delete"),
              onClick: handleDelete,
            },
          ],
        },
      ]}
    />
  )
}

const columnHelper = createColumnHelper<HttpTypes.AdminProduct>()

const createColumns = (
  base: ReturnType<typeof useProductTableColumns>,
  selectAllMode: boolean,
  setSelectAllMode: (value: boolean) => void
) => {
  return [
    columnHelper.display({
      id: "select",
      header: ({ table }) => {
        const isAllPageSelected = table.getIsAllPageRowsSelected()
        const isSomePageSelected = table.getIsSomePageRowsSelected()
        
        return (
          <Checkbox
            checked={
              selectAllMode
                ? true
                : isSomePageSelected
                ? "indeterminate"
                : isAllPageSelected
            }
            onCheckedChange={(value) => {
              if (value) {
                // If clicking when select all is active, do nothing
                if (!selectAllMode) {
                  table.toggleAllPageRowsSelected(true)
                }
              } else {
                // Deselect all
                if (selectAllMode) {
                  setSelectAllMode(false)
                }
                table.toggleAllPageRowsSelected(false)
              }
            }}
          />
        )
      },
      cell: ({ row }) => {
        return (
          <Checkbox
            checked={selectAllMode || row.getIsSelected()}
            disabled={selectAllMode}
            onCheckedChange={(value) => {
              if (!selectAllMode) {
                row.toggleSelected(!!value)
              }
            }}
            onClick={(e) => {
              e.stopPropagation()
            }}
          />
        )
      },
    }),
    ...base,
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        return <ProductActions product={row.original} />
      },
    }),
  ]
}
