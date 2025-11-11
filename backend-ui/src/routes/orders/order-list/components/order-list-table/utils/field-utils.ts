import { HttpTypes } from "@medusajs/types"
import { DEFAULT_FIELDS, DEFAULT_PROPERTIES, DEFAULT_RELATIONS } from "../../../const"

/**
 * Calculates the required fields based on visible columns
 */
export function calculateRequiredFields(
  apiColumns: any[] | undefined,
  visibleColumns: Record<string, boolean>
): string {
  if (!apiColumns?.length) {
    return DEFAULT_FIELDS
  }

  // Get all visible columns
  const visibleColumnObjects = apiColumns.filter(column => {
    // If visibleColumns has data, use it; otherwise use default_visible
    if (Object.keys(visibleColumns).length > 0) {
      return visibleColumns[column.field] === true
    }
    return column.default_visible
  })

  // Collect all required fields from visible columns
  const requiredFieldsSet = new Set<string>()

  visibleColumnObjects.forEach(column => {
    if (column.computed) {
      // For computed columns, add all required and optional fields
      column.computed.required_fields?.forEach(field => requiredFieldsSet.add(field))
      column.computed.optional_fields?.forEach(field => requiredFieldsSet.add(field))
    } else if (!column.field.includes('.')) {
      // Direct field
      requiredFieldsSet.add(column.field)
    } else {
      // Relationship field
      requiredFieldsSet.add(column.field)
    }
  })

  // Separate relationship fields from direct fields
  const allRequiredFields = Array.from(requiredFieldsSet)
  const visibleRelationshipFields = allRequiredFields.filter(field => field.includes('.'))
  const visibleDirectFields = allRequiredFields.filter(field => !field.includes('.'))

  // Check which relationship fields need to be added
  const additionalRelationshipFields = visibleRelationshipFields.filter(field => {
    const [relationName] = field.split('.')
    const isAlreadyCovered = DEFAULT_RELATIONS.some(rel =>
      rel === `*${relationName}` || rel === relationName
    )
    return !isAlreadyCovered
  })

  // Check which direct fields need to be added
  const additionalDirectFields = visibleDirectFields.filter(field => {
    const isAlreadyIncluded = DEFAULT_PROPERTIES.includes(field)
    return !isAlreadyIncluded
  })

  // Combine all additional fields
  const additionalFields = [...additionalRelationshipFields, ...additionalDirectFields]

  // Combine default fields with additional needed fields
  if (additionalFields.length > 0) {
    return `${DEFAULT_FIELDS},${additionalFields.join(',')}`
  }

  return DEFAULT_FIELDS
}