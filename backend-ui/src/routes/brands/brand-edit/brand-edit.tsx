import { Heading } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { RouteDrawer } from "../../../components/modals"
import { useBrand } from "../../../hooks/api/brands"
import { EditBrandForm } from "./components/edit-brand-form/edit-brand-form"

export const BrandEdit = () => {
  const { id } = useParams()
  const { t } = useTranslation()

  const { brand, isLoading, isError, error } = useBrand(id!)

  if (isError) {
    throw error
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <RouteDrawer.Title asChild>
          <Heading>{t("brands.edit.header")}</Heading>
        </RouteDrawer.Title>
        <RouteDrawer.Description className="sr-only">
          {t("brands.edit.description")}
        </RouteDrawer.Description>
      </RouteDrawer.Header>
      {!isLoading && brand && <EditBrandForm brand={brand} />}
    </RouteDrawer>
  )
}

