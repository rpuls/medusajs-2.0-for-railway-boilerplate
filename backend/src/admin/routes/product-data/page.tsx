import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Tabs, Text } from "@medusajs/ui"
import { CogSixTooth } from "@medusajs/icons"

import ProductBulkDeletePage from "../product-bulk-delete/page"
import SpreadsheetSyncPage from "../spreadsheet-sync/page"
import SpreadsheetSyncUpdatePage from "../spreadsheet-sync-update/page"

/**
 * Consolidated entry point for SC Prints' product-data tooling.
 *
 * Three workflows that all operate on Medusa products via CSV / bulk
 * actions used to live as three separate sidebar entries. They are now
 * tabs inside one route so the admin sees a single "Product data" page
 * with a clear description of when to use each tab.
 *
 * The underlying tab bodies are the original page components imported
 * from their original folders — keeping the implementations isolated
 * makes it cheap to revert or rework one tab independently. The three
 * source pages have had their `defineRouteConfig` exports removed so
 * they no longer appear in the sidebar (they're still routable by
 * direct URL for deep links / muscle memory).
 */
const ProductDataPage = () => {
  return (
    <div className="flex flex-col gap-y-4">
      <Container className="flex flex-col gap-y-2">
        <Heading level="h1">Product data</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Bulk operations on the product catalog. Each tab is a separate
          workflow — read the description before running, especially the
          delete tab which cannot be undone.
        </Text>
      </Container>

      <Tabs defaultValue="import-new">
        <Container>
          <Tabs.List>
            <Tabs.Trigger value="import-new">Import new products</Tabs.Trigger>
            <Tabs.Trigger value="update-existing">Update existing</Tabs.Trigger>
            <Tabs.Trigger value="bulk-delete">Bulk delete</Tabs.Trigger>
          </Tabs.List>
        </Container>

        <Tabs.Content value="import-new" className="flex flex-col gap-y-3">
          <Container>
            <Text size="small" className="text-ui-fg-subtle">
              Paste or upload a supplier catalogue CSV (DNC Workwear,
              Fashion Biz, AS Colour Gold, etc.) to <strong>create</strong>{" "}
              new products. Auto-detects the format, expands variants,
              applies category and shipping-profile defaults, and runs the
              import in chunks. Use this when adding a new range — never
              for tweaking existing products.
            </Text>
          </Container>
          <SpreadsheetSyncPage />
        </Tabs.Content>

        <Tabs.Content value="update-existing" className="flex flex-col gap-y-3">
          <Container>
            <Text size="small" className="text-ui-fg-subtle">
              Upload a spreadsheet to <strong>update</strong> existing
              products / variants — pricing, garment-image metadata, colour
              tags, etc. Matches by SKU and only patches the columns you
              tick. Safer than the import tab; still review the preview
              before confirming.
            </Text>
          </Container>
          <SpreadsheetSyncUpdatePage />
        </Tabs.Content>

        <Tabs.Content value="bulk-delete" className="flex flex-col gap-y-3">
          <Container>
            <Text size="small" className="text-ui-tag-red-icon">
              ⚠️ Permanently deletes products in batches of 50. There is no
              undo. Use this for trimming retired ranges out of the
              catalogue. Always verify the search filter before selecting
              rows.
            </Text>
          </Container>
          <ProductBulkDeletePage />
        </Tabs.Content>
      </Tabs>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Product data",
  icon: CogSixTooth,
})

export default ProductDataPage
