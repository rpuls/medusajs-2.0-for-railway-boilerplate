import { useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import { calculateRequiredFields } from "../utils/field-utils"

export function useRequiredFields(
  apiColumns: any[] | undefined,
  visibleColumns: Record<string, boolean>
): string {
  return useMemo(() => {
    return calculateRequiredFields(apiColumns, visibleColumns)
  }, [apiColumns, visibleColumns])
}