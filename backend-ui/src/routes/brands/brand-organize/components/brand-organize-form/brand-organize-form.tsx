import { Button, Container, Heading, Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import {
  RouteFocusModal,
  useRouteModal,
} from "../../../../../components/modals"
import { Brand } from "../../../../../hooks/api/brands"

type BrandOrganizeFormProps = {
  brand: Brand
}

export const BrandOrganizeForm = ({ brand }: BrandOrganizeFormProps) => {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <RouteFocusModal.Header>
        <Heading>{t("brands.organize.header")}</Heading>
      </RouteFocusModal.Header>
      <RouteFocusModal.Body>
        <Container className="divide-y p-0">
          <div className="text-ui-fg-subtle grid grid-cols-2 gap-3 px-6 py-4">
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
      </RouteFocusModal.Body>
      <RouteFocusModal.Footer>
        <RouteFocusModal.Close asChild>
          <Button size="small" variant="secondary">
            {t("actions.cancel")}
          </Button>
        </RouteFocusModal.Close>
        <Button size="small" onClick={() => handleSuccess()}>
          {t("actions.close")}
        </Button>
      </RouteFocusModal.Footer>
    </div>
  )
}

