import { RouteDrawer } from "../../../components/modals"
import { Heading } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { CreateBrandForm } from "./components/create-brand-form/create-brand-form"

export const BrandCreate = () => {
  const { t } = useTranslation()

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <RouteDrawer.Title asChild>
          <Heading>{t("brands.create.header")}</Heading>
        </RouteDrawer.Title>
        <RouteDrawer.Description className="sr-only">
          {t("brands.create.description")}
        </RouteDrawer.Description>
      </RouteDrawer.Header>
      <CreateBrandForm />
    </RouteDrawer>
  )
}

