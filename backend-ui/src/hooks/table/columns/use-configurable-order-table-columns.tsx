import React, { useMemo } from "react"
import { createDataTableColumnHelper } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { getDisplayStrategy, getEntityAccessor } from "../../../lib/table-display-utils"
import { getColumnAlignment } from "../../../routes/orders/order-list/components/order-list-table/utils/column-utils"

const columnHelper = createDataTableColumnHelper<HttpTypes.AdminOrder>()

export function useConfigurableOrderTableColumns(apiColumns: any[] | undefined) {
  return useMemo(() => {
    if (!apiColumns?.length) {
      return []
    }

    return apiColumns.map(apiColumn => {
      // Get the display strategy for this column
      const displayStrategy = getDisplayStrategy(apiColumn)

      // Get the entity-specific accessor or use default
      const accessor = getEntityAccessor('orders', apiColumn.field, apiColumn)

      // Determine header alignment
      const headerAlign = getColumnAlignment(apiColumn)

      return columnHelper.accessor(accessor, {
        id: apiColumn.field,
        header: () => apiColumn.name,
        cell: ({ getValue, row }) => {
          const value = getValue()

          // If the value is already a React element (from computed columns), return it directly
          if (React.isValidElement(value)) {
            return value
          }

          // Otherwise, use the display strategy to format the value
          return displayStrategy(value, row.original)
        },
        meta: {
          name: apiColumn.name,
          column: apiColumn, // Store column metadata for future use
        },
        enableHiding: apiColumn.hideable,
        enableSorting: false, // Disable sorting for all columns
        headerAlign, // Pass the header alignment to the DataTable
      } as any)
    })
  }, [apiColumns])
}
