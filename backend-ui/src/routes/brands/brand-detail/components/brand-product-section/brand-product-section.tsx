import { PlusMini } from "@medusajs/icons"
import {
  Checkbox,
  CommandBar,
  Container,
  Heading,
  toast,
  usePrompt,
} from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { RowSelectionState, createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { ActionMenu } from "../../../../../components/common/action-menu"
import { _DataTable } from "../../../../../components/table/data-table"
import { useBrandProducts, useUpdateBrandProducts, Brand } from "../../../../../hooks/api/brands"
import { useProducts } from "../../../../../hooks/api/products"
import { useProductTableColumns } from "../../../../../hooks/table/columns/use-product-table-columns"
import { useProductTableFilters } from "../../../../../hooks/table/filters/use-product-table-filters"
import { useProductTableQuery } from "../../../../../hooks/table/query/use-product-table-query"
import { useDataTable } from "../../../../../hooks/use-data-table"
import { HttpTypes } from "@medusajs/types"

type BrandProductSectionProps = {
  brand: Brand
}

const PAGE_SIZE = 10

export const BrandProductSection = ({
  brand,
}: BrandProductSectionProps) => {
  const { t } = useTranslation()
  const prompt = usePrompt()

  const [selection, setSelection] = useState<RowSelectionState>({})

  // Fetch product IDs linked to this brand
  const { products: brandProducts, isLoading: isLoadingBrandProducts } = useBrandProducts(brand.id)
  const brandProductIds = useMemo(() => {
    return brandProducts?.map(p => p.id) || []
  }, [brandProducts])

  const { raw, searchParams } = useProductTableQuery({ pageSize: PAGE_SIZE })
  
  // Fetch all products (we'll filter by brand product IDs)
  const { products, isLoading: isLoadingProducts, isError, error } = useProducts(
    {
      ...searchParams,
    },
    {
      placeholderData: keepPreviousData,
    }
  )

  // Filter products to only show those linked to this brand
  const filteredProducts = useMemo(() => {
    if (!products || brandProductIds.length === 0) return []
    return products.filter(p => brandProductIds.includes(p.id))
  }, [products, brandProductIds])

  const filteredCount = filteredProducts.length
  const isLoading = isLoadingBrandProducts || isLoadingProducts

  const columns = useColumns()
  const filters = useProductTableFilters(["categories"])

  const { table } = useDataTable({
    data: filteredProducts || [],
    columns,
    count: filteredProducts?.length || 0,
    getRowId: (original) => original.id,
    pageSize: PAGE_SIZE,
    enableRowSelection: true,
    enablePagination: true,
    rowSelection: {
      state: selection,
      updater: setSelection,
    },
  })

  const { mutateAsync } = useUpdateBrandProducts(brand.id)

  const handleRemove = async () => {
    const selected = Object.keys(selection)

    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("brands.products.remove.confirmation", {
        count: selected.length,
      }),
      confirmText: t("actions.remove"),
      cancelText: t("actions.cancel"),
    })

    if (!res) {
      return
    }

    await mutateAsync(
      {
        remove: selected,
      },
      {
        onSuccess: () => {
          toast.success(
            t("brands.products.remove.successToast", {
              count: selected.length,
            })
          )

          setSelection({})
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  }

  if (isError) {
    throw error
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t("products.domain")}</Heading>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: t("actions.add"),
                  icon: <PlusMini />,
                  to: "products",
                },
              ],
            },
          ]}
        />
      </div>
      <_DataTable
        table={table}
        filters={filters}
        columns={columns}
        orderBy={[
          { key: "title", label: t("fields.title") },
          { key: "created_at", label: t("fields.createdAt") },
          { key: "updated_at", label: t("fields.updatedAt") },
        ]}
        pageSize={PAGE_SIZE}
        count={filteredCount}
        navigateTo={(row) => `/products/${row.id}`}
        isLoading={isLoading}
        queryObject={raw}
        noRecords={{
          message: t("brands.products.list.noRecordsMessage"),
        }}
      />
      <CommandBar open={!!Object.keys(selection).length}>
        <CommandBar.Bar>
          <CommandBar.Value>
            {t("general.countSelected", {
              count: Object.keys(selection).length,
            })}
          </CommandBar.Value>
          <CommandBar.Seperator />
          <CommandBar.Command
            action={handleRemove}
            label={t("actions.remove")}
            shortcut="r"
          />
        </CommandBar.Bar>
      </CommandBar>
    </Container>
  )
}

const columnHelper = createColumnHelper<HttpTypes.AdminProduct>()

const useColumns = () => {
  const base = useProductTableColumns()

  return useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => {
          return (
            <Checkbox
              checked={
                table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : table.getIsAllPageRowsSelected()
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
            />
          )
        },
        cell: ({ row }) => {
          return (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              onClick={(e) => {
                e.stopPropagation()
              }}
            />
          )
        },
      }),
      ...base,
    ],
    [base]
  )
}
