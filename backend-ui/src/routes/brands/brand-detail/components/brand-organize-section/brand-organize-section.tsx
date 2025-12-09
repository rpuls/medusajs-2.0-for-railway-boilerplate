import { PencilSquare } from "@medusajs/icons"
import { Container, Heading, Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { Brand } from "../../../../../hooks/api/brands"

type BrandOrganizeSectionProps = {
  brand: Brand
}

export const BrandOrganizeSection = ({
  brand,
}: BrandOrganizeSectionProps) => {
  const { t } = useTranslation()

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t("brands.organize.header")}</Heading>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: t("brands.organize.action"),
                  icon: <PencilSquare />,
                  to: `organize`,
                },
              ],
            },
          ]}
        />
      </div>
      <div className="text-ui-fg-subtle grid grid-cols-2 items-start gap-3 px-6 py-4">
        <Text size="small" leading="compact" weight="plus">
          {t("brands.fields.name.label")}
        </Text>
        <Text size="small" leading="compact">
          {brand.name}
        </Text>
      </div>
      {brand.image_url && (
        <div className="text-ui-fg-subtle grid grid-cols-2 items-start gap-3 px-6 py-4">
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
      <div className="text-ui-fg-subtle grid grid-cols-2 items-start gap-3 px-6 py-4">
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

