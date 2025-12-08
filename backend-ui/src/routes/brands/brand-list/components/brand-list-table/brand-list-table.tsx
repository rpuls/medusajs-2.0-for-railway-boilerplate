import { PencilSquare, Trash } from "@medusajs/icons"
import { Button, Container, Heading, Text } from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { _DataTable } from "../../../../../components/table/data-table"
import { useBrands, Brand, useDeleteBrand } from "../../../../../hooks/api/brands"
import { useDataTable } from "../../../../../hooks/use-data-table"

const PAGE_SIZE = 20

export const BrandListTable = () => {
  const { t } = useTranslation()

  const { brands, isLoading, isError, error } = useBrands({
    placeholderData: keepPreviousData,
  })

  const columns = useColumns()

  const { table } = useDataTable({
    data: brands || [],
    columns,
    count: brands?.length || 0,
    getRowId: (original) => original.id,
    pageSize: PAGE_SIZE,
  })

  if (isError) {
    throw error
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>{t("brands.domain")}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {t("brands.subtitle")}
          </Text>
        </div>
        <div className="flex items-center gap-x-2">
          <Button size="small" variant="secondary" asChild>
            <Link to="create">{t("actions.create")}</Link>
          </Button>
        </div>
      </div>
      <_DataTable
        table={table}
        columns={columns}
        count={brands?.length || 0}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        navigateTo={(row) => row.id}
        search
        pagination
      />
    </Container>
  )
}

const BrandRowActions = ({ brand }: { brand: Brand }) => {
  const { t } = useTranslation()
  const deleteBrand = useDeleteBrand(brand.id)

  const handleDelete = async () => {
    if (confirm(t("brands.delete.confirmation", { name: brand.name }))) {
      try {
        await deleteBrand.mutateAsync()
      } catch (error) {
        // Error handling
      }
    }
  }

  return (
    <ActionMenu
      groups={[
        {
          actions: [
            {
              label: t("actions.edit"),
              icon: <PencilSquare />,
              to: `${brand.id}/edit`,
            },
          ],
        },
        {
          actions: [
            {
              label: t("actions.delete"),
              icon: <Trash />,
              onClick: handleDelete,
            },
          ],
        },
      ]}
    />
  )
}

const columnHelper = createColumnHelper<Brand>()

const useColumns = () => {
  const { t } = useTranslation()

  return useMemo(
    () => [
      columnHelper.accessor("name", {
        header: t("fields.name"),
        cell: ({ getValue }) => getValue(),
      }),
      columnHelper.accessor("image_url", {
        header: t("brands.fields.image.label"),
        cell: ({ getValue }) => {
          const imageUrl = getValue()
          return imageUrl ? (
            <img src={imageUrl} alt="" className="h-8 w-8 rounded object-cover" />
          ) : (
            <Text size="small" className="text-ui-fg-subtle">-</Text>
          )
        },
      }),
      columnHelper.accessor("product_count", {
        header: t("brands.fields.products.label"),
        cell: ({ getValue }) => {
          const count = getValue()
          return <Text size="small">{count || 0}</Text>
        },
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => {
          return <BrandRowActions brand={row.original} />
        },
      }),
    ],
    [t]
  )
}

