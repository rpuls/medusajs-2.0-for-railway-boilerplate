import { ShoppingBag, TruckFast } from "@medusajs/icons"
import { Container, Heading } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { useLoaderData } from "react-router-dom"

import { useStockLocations } from "../../../hooks/api/stock-locations"
import LocationListItem from "./components/location-list-item/location-list-item"
import { LOCATION_LIST_FIELDS } from "./constants"
import { shippingListLoader } from "./loader"

import { SidebarLink } from "../../../components/common/sidebar-link/sidebar-link"
import { TwoColumnPage } from "../../../components/layout/pages"
import { useExtension } from "../../../providers/extension-provider"
import { LocationListHeader } from "./components/location-list-header"

export function LocationList() {
  const initialData = useLoaderData() as Awaited<
    ReturnType<typeof shippingListLoader>
  >

  const {
    stock_locations: stockLocations = [],
    isError,
    error,
  } = useStockLocations(
    {
      fields: LOCATION_LIST_FIELDS,
    },
    { initialData }
  )

  const { getWidgets } = useExtension()

  if (isError) {
    throw error
  }

  return (
    <TwoColumnPage
      widgets={{
        after: getWidgets("location.list.after"),
        before: getWidgets("location.list.before"),
        sideAfter: getWidgets("location.list.side.after"),
        sideBefore: getWidgets("location.list.side.before"),
      }}
      showJSON
    >
      <TwoColumnPage.Main>
        <LocationListHeader />
        <div className="flex flex-col gap-3 lg:col-span-2">
          {stockLocations.map((location) => (
            <LocationListItem key={location.id} location={location} />
          ))}
        </div>
      </TwoColumnPage.Main>
      <TwoColumnPage.Sidebar>
        <LinksSection />
      </TwoColumnPage.Sidebar>
    </TwoColumnPage>
  )
}

const LinksSection = () => {
  const { t } = useTranslation()

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t("stockLocations.sidebar.header")}</Heading>
      </div>

      <SidebarLink
        to="/settings/locations/shipping-profiles"
        labelKey={t("stockLocations.sidebar.shippingProfiles.label")}
        descriptionKey={t(
          "stockLocations.sidebar.shippingProfiles.description"
        )}
        icon={<ShoppingBag />}
      />
      <SidebarLink
        to="/settings/locations/shipping-option-types"
        labelKey={t("stockLocations.sidebar.shippingOptionTypes.label")}
        descriptionKey={t(
          "stockLocations.sidebar.shippingOptionTypes.description"
        )}
        icon={<TruckFast />}
      />
    </Container>
  )
}
