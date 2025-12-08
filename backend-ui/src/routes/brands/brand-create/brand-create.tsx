import { RouteFocusModal } from "../../../components/modals"
import { Heading } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { CreateBrandForm } from "./components/create-brand-form/create-brand-form"

export const BrandCreate = () => {
  const { t } = useTranslation()

  return (
    <RouteFocusModal>
      <RouteFocusModal.Header>
        <RouteFocusModal.Title asChild>
          <Heading>{t("brands.create.header")}</Heading>
        </RouteFocusModal.Title>
        <RouteFocusModal.Description className="sr-only">
          {t("brands.create.description")}
        </RouteFocusModal.Description>
      </RouteFocusModal.Header>
      <CreateBrandForm />
    </RouteFocusModal>
  )
}

