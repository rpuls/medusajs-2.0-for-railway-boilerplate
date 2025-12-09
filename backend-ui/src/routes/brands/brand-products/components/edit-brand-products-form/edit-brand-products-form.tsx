import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button, Checkbox, Hint, Tooltip, toast } from "@medusajs/ui"
import {
  OnChangeFn,
  RowSelectionState,
  createColumnHelper,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  RouteFocusModal,
  useRouteModal,
} from "../../../../../components/modals"
import { _DataTable } from "../../../../../components/table/data-table"
import { KeyboundForm } from "../../../../../components/utilities/keybound-form"
import { useUpdateBrandProducts } from "../../../../../hooks/api/brands"
import { useProducts } from "../../../../../hooks/api/products"
import { useProductTableColumns } from "../../../../../hooks/table/columns/use-product-table-columns"
import { useProductTableFilters } from "../../../../../hooks/table/filters/use-product-table-filters"
import { useProductTableQuery } from "../../../../../hooks/table/query/use-product-table-query"
import { useDataTable } from "../../../../../hooks/use-data-table"
import { HttpTypes } from "@medusajs/types"

type EditBrandProductsFormProps = {
  brandId: string
  products?: Array<{ id: string }>
}

const EditBrandProductsSchema = z.object({
  product_ids: z.array(z.string()),
})

const PAGE_SIZE = 50
const PREFIX = "p"

export const EditBrandProductsForm = ({
  brandId,
  products = [],
}: EditBrandProductsFormProps) => {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()

  const [selection, setSelection] = useState<RowSelectionState>(
    products.reduce((acc, p) => {
      acc[p.id!] = true
      return acc
    }, {} as RowSelectionState)
  )

  const form = useForm<z.infer<typeof EditBrandProductsSchema>>({
    defaultValues: {
      product_ids: [],
    },
    resolver: zodResolver(EditBrandProductsSchema),
  })

  const updater: OnChangeFn<RowSelectionState> = (newSelection) => {
    const value =
      typeof newSelection === "function"
        ? newSelection(selection)
        : newSelection

    form.setValue("product_ids", Object.keys(value), {
      shouldDirty: true,
      shouldTouch: true,
    })

    setSelection(value)
  }

  const { searchParams, raw } = useProductTableQuery({
    pageSize: PAGE_SIZE,
    prefix: PREFIX,
  })

  const {
    products: data,
    count,
    isPending,
    isError,
    error,
  } = useProducts({
    ...searchParams,
  })

  const columns = useColumns()
  const filters = useProductTableFilters(["categories"])

  const { table } = useDataTable({
    data,
    columns,
    getRowId: (original) => original.id,
    count,
    pageSize: PAGE_SIZE,
    prefix: PREFIX,
    enableRowSelection: (row) => {
      return !products.some((p) => p.id === row.original.id)
    },
    enablePagination: true,
    rowSelection: {
      state: selection,
      updater,
    },
  })

  const { mutateAsync, isPending: isMutating } =
    useUpdateBrandProducts(brandId)

  const handleSubmit = form.handleSubmit(async (data) => {
    // Filter out products that are already assigned to this brand
    const existingProductIds = products.map((p) => p.id)
    const newProductIds = data.product_ids.filter(
      (id) => !existingProductIds.includes(id)
    )

    if (newProductIds.length === 0) {
      handleSuccess()
      return
    }

    await mutateAsync(
      {
        add: newProductIds,
      },
      {
        onSuccess: () => {
          toast.success(
            t("brands.products.add.successToast", {
              count: newProductIds.length,
            })
          )

          handleSuccess()
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  })

  if (isError) {
    throw error
  }

  return (
    <RouteFocusModal.Form form={form}>
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex h-full flex-col overflow-hidden"
      >
        <RouteFocusModal.Header>
          <div className="flex items-center justify-end gap-x-2">
            {form.formState.errors.product_ids && (
              <Hint variant="error">
                {form.formState.errors.product_ids.message}
              </Hint>
            )}
          </div>
        </RouteFocusModal.Header>
        <RouteFocusModal.Body className="size-full overflow-hidden">
          <_DataTable
            table={table}
            columns={columns}
            pageSize={PAGE_SIZE}
            count={count}
            queryObject={raw}
            filters={filters}
            orderBy={[
              { key: "title", label: t("fields.title") },
              { key: "created_at", label: t("fields.createdAt") },
              { key: "updated_at", label: t("fields.updatedAt") },
            ]}
            prefix={PREFIX}
            isLoading={isPending}
            layout="fill"
            pagination
            search="autofocus"
          />
        </RouteFocusModal.Body>
        <RouteFocusModal.Footer>
          <RouteFocusModal.Close asChild>
            <Button size="small" variant="secondary">
              {t("actions.cancel")}
            </Button>
          </RouteFocusModal.Close>
          <Button size="small" type="submit" isLoading={isMutating}>
            {t("actions.save")}
          </Button>
        </RouteFocusModal.Footer>
      </KeyboundForm>
    </RouteFocusModal.Form>
  )
}

const columnHelper = createColumnHelper<HttpTypes.AdminProduct>()

const useColumns = () => {
  const { t } = useTranslation()
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
          const isPreSelected = !row.getCanSelect()
          const isSelected = row.getIsSelected() || isPreSelected

          const Component = (
            <Checkbox
              checked={isSelected}
              disabled={isPreSelected}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              onClick={(e) => {
                e.stopPropagation()
              }}
            />
          )

          if (isPreSelected) {
            return (
              <Tooltip
                content={t("brands.products.add.disabledTooltip")}
                side="right"
              >
                {Component}
              </Tooltip>
            )
          }

          return Component
        },
      }),
      ...base,
    ],
    [t, base]
  )
}

