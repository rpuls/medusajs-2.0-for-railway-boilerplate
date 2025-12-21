import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Filter } from "../../../../../components/table/data-table"
import { useRegions } from "../../../../../hooks/api/regions"
import { useSalesChannels } from "../../../../../hooks/api/sales-channels"

/**
 * Hook to create filters in the format expected by the deprecated DataTable component
 */
export const useOrderTableFilters = () => {
  const { t } = useTranslation()

  const { regions } = useRegions({
    limit: 1000,
    fields: "id,name",
  })

  const { sales_channels } = useSalesChannels({
    limit: 1000,
    fields: "id,name",
  })

  // Until we migrate to the new DataTable component, we can't use `createDataTableFilterHelper` filter structure, since th identifier there is `is` 
  // while deprecated component expexts `key`. Will be ready to migrate once SUP-2651 is done
  return useMemo(() => {
    const filters: Filter[] = [
      {
        key: "created_at",
        label: t("fields.createdAt"),
        type: "date",
      },
      {
        key: "updated_at",
        label: t("fields.updatedAt"),
        type: "date",
      },
    ]

    if (regions?.length) {
      filters.push({
        key: "region_id",
        label: t("fields.region"),
        type: "select",
        multiple: true,
        searchable: true,
        options: regions.map((r) => ({
          label: r.name,
          value: r.id,
        })),
      })
    }

    if (sales_channels?.length) {
      filters.push({
        key: "sales_channel_id",
        label: t("fields.salesChannel"),
        type: "select",
        multiple: true,
        searchable: true,
        options: sales_channels.map((s) => ({
          label: s.name,
          value: s.id,
        })),
      })
    }

    // TODO: Add payment and fulfillment status filters when they are properly linked to orders
    // Note: These filters are commented out in the legacy implementation as well

    return filters
  }, [regions, sales_channels, t])
}
