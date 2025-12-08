import { Container, Heading, Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { Brand } from "../../../../../hooks/api/brands"

type BrandProductSectionProps = {
  brand: Brand
}

export const BrandProductSection = ({
  brand,
}: BrandProductSectionProps) => {
  const { t } = useTranslation()

  // TODO: Fetch products linked to this brand
  // For now, just show the product count
  const productCount = brand.product_count || 0

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t("brands.products.header")}</Heading>
      </div>
      <div className="px-6 py-4">
        <Text size="small" className="text-ui-fg-subtle">
          {t("brands.products.assigned", { count: productCount })}
        </Text>
        {/* TODO: Add product table similar to CategoryProductSection */}
      </div>
    </Container>
  )
}

