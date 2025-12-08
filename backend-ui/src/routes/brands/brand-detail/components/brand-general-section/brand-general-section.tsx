import { PencilSquare, Trash } from "@medusajs/icons"
import { Container, Heading, Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { Brand, useDeleteBrand } from "../../../../../hooks/api/brands"

type BrandGeneralSectionProps = {
  brand: Brand
}

export const BrandGeneralSection = ({
  brand,
}: BrandGeneralSectionProps) => {
  const { t } = useTranslation()
  const deleteBrand = useDeleteBrand(brand.id)

  const handleDelete = async () => {
    if (confirm(t("brands.delete.confirmation", { name: brand.name }))) {
      try {
        await deleteBrand.mutateAsync()
        // Navigate back to list
        window.location.href = "/brands"
      } catch (error) {
        // Error handling
      }
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>{brand.name}</Heading>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: t("actions.edit"),
                  icon: <PencilSquare />,
                  to: "edit",
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
      </div>
      {brand.image_url && (
        <div className="text-ui-fg-subtle grid grid-cols-2 gap-3 px-6 py-4">
          <Text size="small" leading="compact" weight="plus">
            {t("brands.fields.image.label")}
          </Text>
          <img
            src={brand.image_url}
            alt={brand.name}
            className="h-24 w-24 rounded object-cover"
          />
        </div>
      )}
      <div className="text-ui-fg-subtle grid grid-cols-2 gap-3 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          {t("brands.fields.productCount.label")}
        </Text>
        <Text size="small" leading="compact">
          {brand.product_count || 0}
        </Text>
      </div>
    </Container>
  )
}

