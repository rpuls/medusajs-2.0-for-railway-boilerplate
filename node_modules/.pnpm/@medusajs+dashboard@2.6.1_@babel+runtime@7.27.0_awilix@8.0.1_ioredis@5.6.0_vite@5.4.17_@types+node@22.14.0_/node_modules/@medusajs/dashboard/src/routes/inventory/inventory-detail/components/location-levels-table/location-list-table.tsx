import { _DataTable } from "../../../../../components/table/data-table"
import { useInventoryItemLevels } from "../../../../../hooks/api/inventory"
import { useDataTable } from "../../../../../hooks/use-data-table"
import { useLocationListTableColumns } from "./use-location-list-table-columns"
import { useLocationLevelTableQuery } from "./use-location-list-table-query"

const PAGE_SIZE = 20

export const ItemLocationListTable = ({
  inventory_item_id,
}: {
  inventory_item_id: string
}) => {
  const { searchParams, raw } = useLocationLevelTableQuery({
    pageSize: PAGE_SIZE,
  })

  const {
    inventory_levels,
    count,
    isPending: isLoading,
    isError,
    error,
  } = useInventoryItemLevels(inventory_item_id, {
    ...searchParams,
    fields: "*stock_locations",
  })

  const columns = useLocationListTableColumns()

  const { table } = useDataTable({
    data: inventory_levels ?? [],
    columns,
    count,
    enablePagination: true,
    getRowId: (row) => row.id,
    pageSize: PAGE_SIZE,
  })

  if (isError) {
    throw error
  }

  return (
    <_DataTable
      table={table}
      columns={columns}
      pageSize={PAGE_SIZE}
      count={count}
      isLoading={isLoading}
      pagination
      queryObject={raw}
    />
  )
}
