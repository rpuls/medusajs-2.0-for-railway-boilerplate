import { InjectionZone } from "@medusajs/admin-shared"
import { SingleColumnPage } from "../../../components/layout/pages"
import { useExtension } from "../../../providers/extension-provider"
import { BrandListTable } from "./components/brand-list-table/brand-list-table"

export const BrandList = () => {
  const { getWidgets } = useExtension()

  return (
    <SingleColumnPage
      widgets={{
        after: getWidgets("brand.list.after" as InjectionZone),
        before: getWidgets("brand.list.before" as InjectionZone),
      }}
      hasOutlet
    >
      <BrandListTable />
    </SingleColumnPage>
  )
}

