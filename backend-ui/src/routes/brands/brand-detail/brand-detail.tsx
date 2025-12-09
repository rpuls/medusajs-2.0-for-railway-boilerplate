import { useLoaderData, useParams } from "react-router-dom"
import { InjectionZone } from "@medusajs/admin-shared"
import { useBrand, BrandResponse } from "../../../hooks/api/brands"
import { BrandGeneralSection } from "./components/brand-general-section/brand-general-section"
import { BrandProductSection } from "./components/brand-product-section/brand-product-section"
import { BrandOrganizeSection } from "./components/brand-organize-section"

import { TwoColumnPageSkeleton } from "../../../components/common/skeleton"
import { TwoColumnPage } from "../../../components/layout/pages"
import { useExtension } from "../../../providers/extension-provider"

export const BrandDetail = () => {
  const { id } = useParams()

  const initialData = useLoaderData() as BrandResponse

  const { getWidgets } = useExtension()

  const { brand, isLoading, isError, error } = useBrand(id!, {
    initialData,
  })

  if (isLoading || !brand) {
    return (
      <TwoColumnPageSkeleton
        mainSections={2}
        sidebarSections={1}
        showJSON
        showMetadata
      />
    )
  }

  if (isError) {
    throw error
  }

  return (
    <TwoColumnPage
      widgets={{
        after: getWidgets("brand.details.after" as InjectionZone),
        before: getWidgets("brand.details.before" as InjectionZone),
        sideAfter: getWidgets("brand.details.side.after" as InjectionZone),
        sideBefore: getWidgets("brand.details.side.before" as InjectionZone),
      }}
      showJSON
      showMetadata
      data={brand}
    >
      <TwoColumnPage.Main>
        <BrandGeneralSection brand={brand} />
        <BrandProductSection brand={brand} />
      </TwoColumnPage.Main>
      <TwoColumnPage.Sidebar>
        <BrandOrganizeSection brand={brand} />
      </TwoColumnPage.Sidebar>
    </TwoColumnPage>
  )
}

